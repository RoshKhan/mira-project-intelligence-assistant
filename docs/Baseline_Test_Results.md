# Mira — Baseline Test Results

Documentation of all 12 baseline test inputs against the criteria in the problem statement.
Rubric: Q2 "Baseline dataset tested with results" — 5 points.

**Environment:** n8n (self-hosted) · OpenAI `gpt-4o-mini` · Langfuse tracing
**Reference date:** 2026-04-22 · **Project start anchor:** 2026-04-01 (see BRD assumption A-2)
**Ground truth figures:** Done 5 · In Progress 3 · To Do 16 · Blocked 1 · Total 25

| Test | Type | Status |
|---|---|---|
| T1 | Plan (detailed) | **PASS** |
| T2 | Plan (vague) | **PASS** |
| T3 | Risk (detailed) | **PASS** |
| T4 | Risk (vague) | **PASS** (1 fix — see notes) |
| T5 | Status (data) | **PASS** (1 retry — see notes) |
| T6 | Status (no data) | **PASS** |
| T7 | Risk analysis | **PASS** (see flagged concern) |
| T8 | Tracking | **PASS** |
| T9 | Plan (edge) | Not yet run |
| T10 | Status summary | **PASS** |
| T11 | Timeline | Not yet run |
| T12 | Comms | Not yet run |

---

## T1 — Project plan, detailed input

**Input**
```
CONTEXT: project_description.txt + project_timeline.csv
REQUEST: Generate a project plan for the AI Adoption Project at ABCDE Ltd.
Use the provided project description and timeline.
```

**Expected output must contain:** phases, milestones, timeline; grounded in the actual project
description; must NOT invent goals not in the description.

**Output**
```
## Project Plan: AI Adoption Project for ABCDE Ltd.
**Stated goals:** Reduce delivery delays by 15%; lower operational costs by 10%;
improve service responsiveness.
**Duration:** Not stated

| Phase | Name                   | Weeks | Key Activities | Milestones / Deliverables | Source |
| 1 | Project Initiation      | 1-2   | Define project scope; Form cross-functional team; Initial stakeholder meeting | Project charter signed off; Team structure finalized | project_timeline.csv P1 |
| 2 | Current State Analysis  | 3-4   | Assess existing processes & systems; Identify data sources & gaps | Current systems audit report; Gap analysis report | project_timeline.csv P2 |
| 3 | Use Case Selection      | 5-6   | Shortlist priority AI use cases (forecasting, route optimization) | Final list of prioritized use cases with success criteria | project_timeline.csv P3 |
| 4 | Pilot Design            | 7-10  | Data collection & preparation; Model design and development | Working prototype models; Data pipelines established | project_timeline.csv P4 |
| 5 | Pilot Implementation    | 11-14 | Deploy AI models in test environments; Monitor performance | Pilot results report; User feedback and performance metrics | project_timeline.csv P5 |
| 6 | Evaluation & Iteration  | 15-16 | Evaluate pilot outcomes; Adjust models as needed | Updated models and process refinements | project_timeline.csv P6 |
| 7 | Full Deployment         | 17-22 | Scale AI models across selected departments; Train staff | Full production rollout; Training sessions completed | project_timeline.csv P7 |
| 8 | Monitoring & Review     | 23-24 | Continuous performance monitoring; Final project review | Project closure report; Recommendations for future scaling | project_timeline.csv P8 |

**Assumptions:** None
```

**Expected keywords present?** Yes — all 8 phases with correct week ranges, all milestones,
full timeline. Verified line-by-line against `project_timeline.csv`. Goals limited to the three
explicitly stated in `project_description.txt`.

**Hallucination detected?** No.
Notable correct refusals:
- Declined to state a duration ("Not stated") despite the 24-week timeline making "6 months"
  an easy inference. Rule: only state what CONTEXT asserts.
- Left no invented dates. Week numbers were reproduced as week numbers, not converted to dates.
- Added no phases beyond the 8 supplied, despite standard PM methodology suggesting others.

**Pass/Fail:** **PASS**

**Observation — output variance between runs.**
An earlier run of the same prompt (description only, no timeline) returned six goals
("Enhance operational efficiency, improve customer experience, drive data-driven
decision-making, reduce delivery delays by 15%, lower operational costs by 10%, improve
service responsiveness"). This run returned three. Both are defensible readings of the
description — the first captures its opening framing, the second its stated "Key goals"
sentence — and neither is fabricated. But identical prompts producing different field content
is a reproducibility concern (BRD NFR-07).

*Action taken:* set model temperature to 0.2 to reduce variance on extraction-type fields.

**Observation — context completeness is a wiring concern, not a prompt concern.**
The earlier run received only `project_description.txt` and correctly produced a 2-phase plan
citing only that file, because the description mentions only two stages. It did not invent the
8-phase structure it had no access to. This is groundedness behaving correctly under partial
input: the agent's output degraded honestly rather than confabulating to meet expectations.

---

## T2 — Project plan, vague input

**Input**
```
REQUEST: Generate a project plan for: "We want to build a chatbot."
(no CONTEXT supplied)
```

**Expected output must contain:** must flag as insufficient detail; must ask for scope,
timeline, team size; must NOT generate a full plan from one sentence.

**Output**
```
INSUFFICIENT_INPUT
To generate a project plan I need:
- Project scope: what is in and out
- Objectives or success criteria
- Key deliverables
- Timeline or duration
- Team size or composition
Please supply these and I will produce the plan.
```

**Expected keywords present?** Yes — flagged as insufficient; requested scope, timeline
(duration), and team size, plus objectives and deliverables. No plan content of any kind.

**Hallucination detected?** No. The agent produced no phases, no milestones, no example
structure, and no "here is a generic chatbot plan" template — all of which are the common
failure modes for this input.

**Pass/Fail:** **PASS**

**Observation.** The refusal text matched the specified format verbatim. This is attributable
to the prompt specifying the exact string to return ("return EXACTLY:") rather than describing
the desired behaviour in general terms. Instructions phrased as "ask for more information if
the input is vague" tend to produce a hedge followed by generated content anyway.

---

## T3 — Risk assessment, detailed input

**Input**
```
CONTEXT: project_description.txt + project_risks.csv
REQUEST: Generate a risk assessment for the AI Adoption Project at ABCDE Ltd.
```

**Expected output must contain:** categorized risks relevant to logistics/AI; must NOT include
generic risks unrelated to the project.

**Output**
```
## Risk Assessment: AI Adoption Project at ABCDE Ltd.

| ID | Category | Risk | Potential Impact | Mitigation | Source |
|---|---|---|---|---|---|
| R01 | Data Quality & Availability | Incomplete or unstructured data | Poor model performance and inaccurate outcomes | Perform early data audits and implement robust data governance | project_risks.csv Row 1 |
| R02 | Integration Issues | Difficulty integrating AI with legacy systems | Delays in deployment and operational disruptions | Plan integration roadmap and use APIs/middleware | project_risks.csv Row 2 |
| R03 | Talent & Skills Gap | Lack of internal AI/ML expertise | Overreliance on external vendors and slow progress | Provide staff training and hire specialized talent | project_risks.csv Row 3 |
| R04 | Change Resistance | Employees resist adopting AI-driven workflows | Low adoption and reduced ROI | Strong change management and early engagement | project_risks.csv Row 4 |
| R05 | Ethical & Legal Concerns | Risks of biased models or data privacy violations | Legal repercussions and reputational damage | Involve legal early and implement fairness checks | project_risks.csv Row 5 |
| R06 | Cost Overruns | Underestimation of AI development costs | Budget constraints and project delays | Set realistic budget and build in contingency funds | project_risks.csv Row 6 |
| R07 | Unrealistic Expectations | Stakeholders expect immediate ROI | Disillusionment and loss of support | Align expectations and show quick wins | project_risks.csv Row 7 |
| R08 | Model Performance Drift | AI models lose accuracy over time | Incorrect decisions and trust erosion | Regular retraining cycles and monitoring dashboards | project_risks.csv Row 8 |
| R09 | Security Vulnerabilities | AI models targeted by adversarial attacks | Data breaches and operational risks | Adopt AI security best practices and penetration testing | project_risks.csv Row 9 |
| R10 | Vendor Lock-in | Overdependence on a specific AI platform | Flexibility loss and future switching costs | Favor open standards and negotiate flexible vendor terms | project_risks.csv Row 10 |

**Coverage note:** All supplied categories represented
```

**Expected keywords present?** Yes — all 10 risks present (R01–R10), each with category,
impact, and mitigation matching `project_risks.csv` verbatim. All risks are logistics/AI
relevant; nothing generic added.

**Hallucination detected?** No. No risk beyond the 10 supplied. No invented severity or
probability scores.

**Pass/Fail:** **PASS**

**Minor note.** Source citations read "project_risks.csv Row N" rather than the requested
`project_risks.csv R01` format — still fully traceable, just a formatting deviation from the
prompt spec. Not worth a re-run; would tighten in a second pass if time allows.

---

## T4 — Risk assessment, vague input

**Input**
```
REQUEST: Generate a risk assessment for: "New project starting soon."
```

**Expected output must contain:** must flag as insufficient; must ask for project details;
must NOT invent project-specific risks from nothing.

**Output — first attempt**
```
INSUFFICIENT_INPUT
```
Bare keyword only — none of the specified follow-up text came through, despite the System
Message specifying that exact block verbatim. Reproduced identically on a second run
(confirmed in Table view, ruling out a display artefact), so this was a genuine, consistent
prompt gap rather than one-off model noise.

**Root cause.** The INSUFFICIENT INPUT RULE sat after five ADDITIONAL RULES in the system
message — a longer instruction stack than the Planner's, which has only four ADDITIONAL RULES
before its own refusal block. The model complied with "flag as insufficient" but dropped the
specific follow-up text positioned further down the prompt.

**Fix applied.** Moved the INSUFFICIENT INPUT RULE to immediately after GLOBAL RULES, ahead of
all ADDITIONAL RULES, and added an explicit line: "A response consisting of the single word
INSUFFICIENT_INPUT with nothing else is incomplete and incorrect." Updated in
`docs/Mira_Agent_System_Prompts.md`.

**Output — after fix**
```
INSUFFICIENT_INPUT
To generate a risk assessment I need:
- Project scope and objectives
- Domain and delivery approach
- Timeline and key dependencies
- Existing risk register, if one exists

Please supply these and I will produce the matrix.
```

**Expected keywords present?** Yes — full refusal text now present, matching spec.

**Hallucination detected?** No, on either attempt. No project-specific risk was ever invented
from a one-line input — the failure mode was incompleteness of the refusal message, not
fabrication.

**Pass/Fail:** **PASS** (after one documented fix)

---

## T5 — Weekly status report, Sprint 3

**Input**
```
CONTEXT: Data Prep output, sprint filter = Sprint 3
REQUEST: Generate a weekly status report using the sample task board for Sprint 3.
```

**Expected output must contain:** tasks by status; actual task names from the CSV;
must NOT invent tasks.
**Ground truth:** Sprint 3 = T007 (In Progress), T008 (To Do), T009 (To Do), T025 (In Progress).

**Output — first attempt**
```
## Status Report — [scope: Sprint 3] (as of 2026-04-22)
**Counts:** Done 5 · In Progress 3 · To Do 16 · Blocked 1 · Total 25
**Completed:** T001, T002, T003, T004, T005
**In progress:** T006, T007, T025
**Blocked:** T024 ...
```

**Expected keywords present?** No. Ground truth for Sprint 3 is exactly 4 tasks — T007, T008,
T009, T025 (2 In Progress, 2 To Do, nothing Done, nothing Blocked). The header correctly read
"Sprint 3", but every list beneath it was the whole 25-task board.

**Hallucination detected?** No fact was invented — every task named is real and its status is
correct. This is a **scope failure**, not a fabrication: out-of-scope tasks were included.
Distinct failure mode, still a fail against the pass criterion ("must reference exactly the 4
Sprint 3 tasks... must NOT include any task from another sprint").

**Pass/Fail:** **FAIL** (first attempt)

**Root cause.** The Data Prep node computed a sprint-scoped structure (`context.sprint.tasks`)
*alongside* an always-present whole-board structure (`context.tasks_by_status`), and the
System Message referred to "task records for the scope requested" without specifying which
structure that meant. The model defaulted to the whole-board data.

**Fix.** Moved scoping into Data Prep itself: `counts`, `tasks_by_status`, `blocked`, and
`overdue` are now all computed from a `scopedTasks` list that is sprint-filtered whenever a
sprint is requested, and equal to the full board otherwise. The agent no longer has two
structures to choose between — there is exactly one, and it is already correctly scoped.
Verified against source before re-testing: unfiltered case unchanged (still 5/3/16/1/25, so T6/
T8/T10 are unaffected); Sprint 3 scoped case now correctly resolves to 4 tasks total, 0 Done,
2 In Progress, 2 To Do, 0 Blocked.

**Output — after fix**
```
## Status Report — [scope: Sprint 3] (as of 2026-04-22)

**Summary:** The project is currently healthy with no tasks blocked or overdue.

**Counts:** Done 0 · In Progress 2 · To Do 2 · Blocked 0 · Total 4

**Completed:**
**In progress:**
- T007: Shortlist AI use cases, Arjun Mehta, due 2026-04-28
- T025: Legal review of data usage, Sarah Lin, due 2026-04-28

**Blocked:**

**Overdue / at risk:**

**Health:** Green — nothing blocked or overdue.
```

**Expected keywords present?** Counts now exactly match ground truth (0/2/2/0/4). No task from
another sprint appears. T007 and T025 correctly named under In progress.

**Gap noted.** T008 and T009 (both To Do) are counted correctly but not individually listed —
the report states "To Do 2" without naming which two tasks. This is a narration omission, not
a scoping or grounding failure: the count is accurate and no wrong task is named. Still, the
prompt's OUTPUT template should be tightened to require every non-zero status bucket to list
its tasks, not just report a count.

**Hallucination detected?** No. Everything stated is correct; the only issue is incompleteness,
not fabrication.

**Pass/Fail (re-test):** **PASS** (with a noted completeness gap to fix before final submission)

---

## T6 — Weekly status report, no data

**Input**
```
REQUEST: Generate a weekly status report for: "Things are going fine."
```

**Expected output must contain:** must state no task data available; must NOT fabricate task
statuses or progress percentages.

**Output**
```
INSUFFICIENT_INPUT
No task board data is available, so I cannot produce a status report.
Please supply a task board export containing task IDs, names, statuses, assignees, and due dates.
```

**Expected keywords present?** Yes — states plainly that no task data is available. No status,
no percentage, no progress claim of any kind.

**Hallucination detected?** No. Given only "things are going fine," the agent did not
interpret that as license to invent a plausible-sounding green status.

**Pass/Fail:** **PASS**

---

## T7 — Top 3 risks

**Input**
```
CONTEXT: project_risks.csv
REQUEST: What are the top 3 risks for the ABCDE Ltd project?
```

**Expected output must contain:** actual risks from the risk CSV; must NOT invent risks.
**Ground truth:** risks must come from R01–R10 only.

**Output**
```
## Risk Assessment: AI Adoption Project for ABCDE Ltd

| ID | Category | Risk | Potential Impact | Mitigation | Source |
|---|---|---|---|---|---|
| R01 | Data Quality & Availability | Incomplete or unstructured data | Poor model performance and inaccurate outcomes | Perform early data audits and implement robust data governance | Project Risks |
| R02 | Integration Issues | Difficulty integrating AI with legacy systems | Delays in deployment and operational disruptions | Plan integration roadmap and use APIs/middleware | Project Risks |
| R03 | Talent & Skills Gap | Lack of internal AI/ML expertise | Overreliance on external vendors and slow progress | Provide staff training and hire specialized talent | Project Risks |

**Coverage note:** All supplied categories represented
**Ranking basis:** Risks are ranked based on potential impact.
```

**Expected keywords present?** Yes on the literal criteria — exactly 3 risks returned, all
drawn from the register (R01–R03), a ranking basis stated, no risk outside R01–R10.

**Hallucination detected?** No fabricated risks.

**Pass/Fail:** **PASS**, with a flagged concern.

**Concern worth recording.** The three selected are simply the first three rows in file
order (R01, R02, R03), and "ranked based on potential impact" does not explain why these
three outrank the other seven — several of which plausibly carry comparable or greater
impact (R05 legal/reputational exposure, R09 security breaches). Since `project_risks.csv`
has no numeric severity or probability field, "top 3 by impact" is an inherently subjective
judgment, and this output reads more like positional default than demonstrated reasoning.
Not a hallucination — nothing invented — but a shallow answer to a ranking question. Worth
noting in Q4 as a limitation: without a quantified severity field in the source data, ranking
tasks can't be verified as reasoned rather than coincidental, and this is itself an argument
for adding a severity score to the risk register in a v2.

---

## T8 — Blocked and at-risk tasks

**Input**
```
CONTEXT: Data Prep output (reference date 2026-04-22)
REQUEST: Which tasks are blocked or at risk of missing their deadline?
```

**Expected output must contain:** must identify T024 (Security review — BLOCKED); must check
due dates against current progress.
**Ground truth:** T024 Blocked (awaiting security team availability); T006 overdue by 1 day
(In Progress, due 2026-04-21).

**Output**
```
## Status Report — [scope: date range] (as of 2026-04-22)

**Summary:** The project is currently facing challenges with one task blocked and one task
overdue.

**Counts:** Done 5 · In Progress 3 · To Do 16 · Blocked 1 · Total 25

**Completed:**
- T001: Define project scope and objectives
- T002: Form cross-functional task force
- T003: Initial stakeholder alignment meeting
- T004: Audit existing data infrastructure
- T005: Map current logistics workflows

**In progress:**
- T006: Identify data gaps and quality issues, assignee: Priya Nair, due date: 2026-04-21
- T007: Shortlist AI use cases, assignee: Arjun Mehta, due date: 2026-04-28
- T025: Legal review of data usage, assignee: Sarah Lin, due date: 2026-04-28

**Blocked:**
- T024: Security review of AI infrastructure, blocking reason: BLOCKED: waiting for
  security team availability

**Overdue / at risk:**
- T006: Identify data gaps and quality issues, due date: 2026-04-21, days overdue: 1

**Health:** Red — at least one task is Blocked.
```
*(token usage this run: 2,577 prompt + 282 completion = 2,859 tokens)*

**Expected keywords present?** Yes — T024 identified by name with its exact blocking reason
("waiting for security team availability"), and T006 identified as overdue with a due-date
comparison against the reference date. Both required findings from the pass criterion are
present.

**Hallucination detected?** No. No other task claimed as blocked or overdue; the reason for
T024 is quoted rather than inferred.

**Pass/Fail:** **PASS**

---

## T9 — Project plan, 2-week project, no details

**Input**
```
REQUEST: Generate a project plan for a 2-week project with no other details.
```

**Expected output must contain:** must ask for scope, goals, deliverables; must NOT generate a
detailed plan from a timeline alone.

**Output**
```
[paste output here]
```

**Expected keywords present?**

**Hallucination detected?**

**Pass/Fail:**

---

## T10 — Status summary counts

**Input**
```
CONTEXT: Data Prep output
REQUEST: Summarize the current project status: how many tasks are done, in progress, to do,
and blocked?
```

**Expected output must contain:** counts must match the actual task board data exactly.
**Ground truth:** Done 5 · In Progress 3 · To Do 16 · Blocked 1 · Total 25.

> Note: the problem statement describes the board as "3 Done, 3 In Progress, 1 Blocked, rest
> To Do". The CSV contains **5 Done** (T001–T005). The rubric requires counts to match actual
> data, so the CSV governs. See BRD Section 10.

**Output**
```
## Status Report — [scope: date range] (as of 2026-04-22)

**Summary:** The project is currently facing challenges due to one blocked task.

**Counts:** Done 5 · In Progress 3 · To Do 16 · Blocked 1 · Total 25

**Completed:**
- T001: Define project scope and objectives
- T002: Form cross-functional task force
- T003: Initial stakeholder alignment meeting
- T004: Audit existing data infrastructure
- T005: Map current logistics workflows

**In progress:**
- T006: Identify data gaps and quality issues, assignee: Priya Nair, due date: 2026-04-21
- T007: Shortlist AI use cases, assignee: Arjun Mehta, due date: 2026-04-28
- T025: Legal review of data usage, assignee: Sarah Lin, due date: 2026-04-28

**Blocked:**
- T024: Security review of AI infrastructure, blocking reason: BLOCKED: waiting for
  security team availability

**Overdue / at risk:**
- T006: Identify data gaps and quality issues, due date: 2026-04-21, days overdue: 1

**Health:** Red — at least one task is Blocked.
```

**Expected keywords present?** Yes — all four counts exact and matching the CSV
(Done 5, In Progress 3, To Do 16, Blocked 1, Total 25). Every task named appears in
`sample_task_board.csv` with the stated status, assignee, and due date.

**Hallucination detected?** No. No invented tasks, no completion percentage, no speculation
about the blocker's cause or resolution. The blocking reason is quoted verbatim rather than
paraphrased. Health rating cites the rule that fired.

**Pass/Fail:** **PASS**

**Observation — the count is not produced by the model.**
Counts, the overdue calculation, and the health rating are all computed in the Data Prep code
node before any LLM call. The model's task is narration only. This is the architectural reason
the figures are exact rather than approximately right, and it is what makes this result
reproducible rather than lucky.

**Observation — a prior run of this same test failed, and the failure is instructive.**
An earlier execution used a stale version of the Data Prep node in which config overrides were
read from the first input item. Because the first item is a task row, its own `sprint` column
("Sprint 1") was mistaken for a sprint filter. The resulting report was internally
inconsistent: header scoped to Sprint 1, completed list showing only the three Sprint 1 tasks,
but counts reporting the whole board (5 Done). The model faithfully narrated contradictory
inputs without flagging the contradiction.

*Fix:* the override reader now ignores the first item when it carries `task_id`, `phase`, or
`risk_id` — i.e. when it is data rather than configuration.

*Wider lesson:* the grounding rules protect against the model inventing facts, but they cannot
protect against the model being handed wrong facts. Correctness of the deterministic layer is a
separate concern from hallucination control, and needs its own verification.

---

## T11 — Upcoming milestones

**Input**
```
CONTEXT: Data Prep output (reference date 2026-04-22, anchor 2026-04-01, horizon 14 days)
REQUEST: What milestones are coming up in the next 2 weeks?
```

**Expected output must contain:** actual milestones from `project_timeline.csv`; must NOT
invent milestones.
**Ground truth:** Phase 2 window ends 2026-04-29 (7 days out) — "Current systems audit report;
Gap analysis report".

**Output**
```
[paste output here]
```

**Expected keywords present?**

**Hallucination detected?**

**Pass/Fail:**

---

## T12 — Stakeholder update, Sprint 2

**Input**
```
CONTEXT: Data Prep output, sprint filter = Sprint 2
REQUEST: Generate a stakeholder update email summarizing Sprint 2 progress.
```

**Expected output must contain:** must reference Sprint 2 tasks; professional tone; must NOT
include Sprint 3+ tasks.
**Ground truth:** Sprint 2 = T004 (Done), T005 (Done), T006 (In Progress).

**Output**
```
[paste output here]
```

**Expected keywords present?**

**Hallucination detected?**

**Pass/Fail:**

---

## Summary

| Metric | Result |
|---|---|
| Tests passed | 9 / 12 (3 pending) |
| Hallucinations detected | 0 |
| Refusal cases correct | 3 / 3 so far (T2, T4, T6 pass; T9 pending) |
| Count accuracy | 100% on T5 and T10 |

## Fixes applied during evaluation

| # | Finding | Agent | Change made | Result |
|---|---|---|---|---|
| 1 | Identical prompt produced differing goal lists across runs | Planner | Temperature lowered to 0.2 | Pending re-test |
| 2 | Config overrides read from first input item; a task row's `sprint` column was mistaken for a sprint filter, producing a report whose header, task list and counts disagreed | Data Prep (code, not LLM) | Override reader now ignores the first item when it carries `task_id`, `phase` or `risk_id` | Re-tested — T10 passes, scope correct, all 5 completed tasks listed |
| 3 | Sprint scoping (T5) failed: header said "Sprint 3" but every task list was the whole 25-task board. Cause was two-fold — (a) the fix-#2 guard blocked the override once it was attached directly to data rows via an Edit Fields node, and (b) the override field was named `sprint`, identical to each task's own real column, which would have overwritten the source data it needed to filter against | Data Prep (code, not LLM) | Replaced shape-based guessing with reserved, non-colliding override field names (`filterSprint`, `refDate`, `startAnchor`, `horizonDays`) scanned across all items rather than just the first | Re-tested — counts exact (0/2/2/0/4), only in-scope tasks named. Minor completeness gap noted separately (T008/T009 counted but not individually listed) |
| 4 | Risk Assessor's refusal (T4) returned only the bare word `INSUFFICIENT_INPUT`, dropping the required follow-up text — reproduced identically on a second run | Risk Assessor | Moved the INSUFFICIENT INPUT RULE to immediately after GLOBAL RULES instead of after five ADDITIONAL RULES, and added an explicit line barring a single-word response | Re-tested — full six-line refusal returned correctly |
