/**
 * Mira — Data Prep (n8n Code node, "Run Once for All Items")
 * ---------------------------------------------------------
 * Computes EVERY figure the agents are allowed to state: status counts,
 * sprint filters, blocked items, overdue items, milestone windows.
 *
 * No LLM touches arithmetic. Agents narrate these values only.
 * This is what makes T5, T8, T10, T11 and T12 correct by construction.
 *
 * INPUT  : items containing parsed CSV rows (task board, timeline, risks)
 *          plus optional { referenceDate, projectStartAnchor, sprint, horizonDays }
 * OUTPUT : one item, { context } — paste into the agent prompt as the CONTEXT block
 */

// ---------- configuration (declare, never infer) ----------
const CONFIG = {
  // Reference "today". The task board implies late April 2026:
  // Sprint 2 complete, Sprint 3 in progress, T006 (due 2026-04-21) still open.
  referenceDate: '2026-04-22',

  // Timeline uses relative week numbers; task board uses absolute dates.
  // No join key exists, so the anchor MUST be declared. BRD assumption A-2.
  projectStartAnchor: '2026-04-01',

  horizonDays: 14,
};

// ---------- helpers ----------
const toDate = (s) => (s ? new Date(String(s).trim() + 'T00:00:00Z') : null);
const DAY_MS = 86400000;
const daysBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / DAY_MS);
const iso = (d) => d.toISOString().slice(0, 10);

function addWeeks(anchorISO, weeks) {
  const d = toDate(anchorISO);
  d.setUTCDate(d.getUTCDate() + weeks * 7);
  return iso(d);
}

// Read overrides passed in from an upstream Set node, if present.
const incoming = $input.first()?.json ?? {};
const referenceDate = incoming.referenceDate || CONFIG.referenceDate;
const projectStartAnchor = incoming.projectStartAnchor || CONFIG.projectStartAnchor;
const horizonDays = Number(incoming.horizonDays ?? CONFIG.horizonDays);
const sprintFilter = incoming.sprint || null;

// ---------- collect rows ----------
// Accepts rows from any upstream CSV parse. Detects type by columns present.
const all = $input.all().map((i) => i.json);

const tasks = all.filter((r) => r && r.task_id);
const phases = all.filter((r) => r && r.phase && r.phase_name);
const risks = all.filter((r) => r && r.risk_id);

// ---------- task aggregates ----------
const norm = (s) => String(s || '').trim();

const counts = { Done: 0, 'In Progress': 0, 'To Do': 0, Blocked: 0 };
for (const t of tasks) {
  const s = norm(t.status);
  if (counts[s] === undefined) counts[s] = 0;
  counts[s] += 1;
}
counts.Total = tasks.length;

const byStatus = (status) =>
  tasks
    .filter((t) => norm(t.status) === status)
    .map((t) => ({
      task_id: t.task_id,
      task_name: t.task_name,
      assignee: t.assignee,
      sprint: t.sprint,
      due_date: t.due_date,
    }));

// Blocked: reason is taken verbatim from the description, never inferred.
const blocked = tasks
  .filter((t) => norm(t.status) === 'Blocked')
  .map((t) => {
    const desc = String(t.description || '');
    const marker = desc.indexOf('BLOCKED');
    return {
      task_id: t.task_id,
      task_name: t.task_name,
      assignee: t.assignee,
      due_date: t.due_date,
      blocking_reason: marker >= 0 ? desc.slice(marker) : desc,
      days_to_due: t.due_date ? daysBetween(referenceDate, t.due_date) : null,
    };
  });

// Overdue: open work whose due date has passed as of the reference date.
const overdue = tasks
  .filter((t) => {
    const s = norm(t.status);
    if (s === 'Done' || !t.due_date) return false;
    return daysBetween(referenceDate, t.due_date) < 0;
  })
  .map((t) => ({
    task_id: t.task_id,
    task_name: t.task_name,
    status: t.status,
    assignee: t.assignee,
    due_date: t.due_date,
    days_overdue: Math.abs(daysBetween(referenceDate, t.due_date)),
  }));

// ---------- sprint scoping ----------
const sprintTasks = sprintFilter
  ? tasks
      .filter((t) => norm(t.sprint) === norm(sprintFilter))
      .map((t) => ({
        task_id: t.task_id,
        task_name: t.task_name,
        status: t.status,
        assignee: t.assignee,
        priority: t.priority,
        due_date: t.due_date,
        description: t.description,
      }))
  : [];

const sprintCounts = sprintTasks.reduce((acc, t) => {
  const s = norm(t.status);
  acc[s] = (acc[s] || 0) + 1;
  return acc;
}, {});
if (sprintFilter) sprintCounts.Total = sprintTasks.length;

// ---------- assignee load ----------
const assigneeLoad = Object.entries(
  tasks.reduce((acc, t) => {
    const a = norm(t.assignee) || 'Unassigned';
    acc[a] = (acc[a] || 0) + 1;
    return acc;
  }, {})
)
  .map(([assignee, task_count]) => ({ assignee, task_count }))
  .sort((a, b) => b.task_count - a.task_count);

// ---------- milestone windows ----------
// Week numbers converted to dates using the declared anchor. Week 1 starts at the anchor.
const milestones = phases.map((p) => {
  const startDate = addWeeks(projectStartAnchor, Number(p.start_week) - 1);
  const endDate = addWeeks(projectStartAnchor, Number(p.end_week));
  return {
    phase: p.phase,
    phase_name: p.phase_name,
    start_week: p.start_week,
    end_week: p.end_week,
    window_start: startDate,
    window_end: endDate,
    days_to_window_end: daysBetween(referenceDate, endDate),
    milestones: p.milestones_deliverables,
    key_activities: p.key_activities,
    source: `project_timeline.csv P${p.phase}`,
  };
});

const upcomingMilestones = milestones.filter(
  (m) => m.days_to_window_end >= 0 && m.days_to_window_end <= horizonDays
);

// ---------- risks ----------
const riskRows = risks.map((r) => ({
  risk_id: r.risk_id,
  category: r.category,
  risk: r.risk_challenge,
  impact: r.impact,
  mitigation: r.mitigation_strategy,
  source: `project_risks.csv ${r.risk_id}`,
}));

// ---------- health (mechanical rule, not model judgement) ----------
const health =
  blocked.length > 0 ? 'Red' : overdue.length > 0 ? 'Amber' : 'Green';
const healthRule =
  blocked.length > 0
    ? 'Red: at least one task is Blocked'
    : overdue.length > 0
    ? 'Amber: tasks overdue, none blocked'
    : 'Green: nothing blocked or overdue';

// ---------- assemble CONTEXT ----------
const context = {
  meta: {
    reference_date: referenceDate,
    project_start_anchor: projectStartAnchor,
    horizon_days: horizonDays,
    sprint_filter: sprintFilter,
    note:
      'All figures below are precomputed. Agents must repeat them exactly and must not recalculate.',
  },
  counts,
  tasks_by_status: {
    Done: byStatus('Done'),
    'In Progress': byStatus('In Progress'),
    'To Do': byStatus('To Do'),
    Blocked: byStatus('Blocked'),
  },
  blocked,
  overdue,
  sprint: sprintFilter ? { name: sprintFilter, counts: sprintCounts, tasks: sprintTasks } : null,
  assignee_load: assigneeLoad,
  milestones,
  upcoming_milestones: upcomingMilestones,
  risks: riskRows,
  health: { rating: health, rule_applied: healthRule },
};

return [{ json: { context, context_text: JSON.stringify(context, null, 2) } }];
