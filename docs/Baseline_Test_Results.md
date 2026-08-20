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
| T3 | Risk (detailed) | Not yet run |
| T4 | Risk (vague) | Not yet run |
| T5 | Status (data) | Not yet run |
| T6 | Status (no data) | Not yet run |
| T7 | Risk analysis | Not yet run |
| T8 | Tracking | Not yet run |
| T9 | Plan (edge) | Not yet run |
| T10 | Status summary | Not yet run |
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
[paste output here]
```

**Expected keywords present?**

**Hallucination detected?**

**Pass/Fail:**

---

## T4 — Risk assessment, vague input

**Input**
```
REQUEST: Generate a risk assessment for: "New project starting soon."
```

**Expected output must contain:** must flag as insufficient; must ask for project details;
must NOT invent project-specific risks from nothing.

**Output**
```
[paste output here]
```

**Expected keywords present?**

**Hallucination detected?**

**Pass/Fail:**

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

**Output**
```
[paste output here]
```

**Expected keywords present?**

**Hallucination detected?**

**Pass/Fail:**

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
[paste output here]
```

**Expected keywords present?**

**Hallucination detected?**

**Pass/Fail:**

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
[paste output here]
```

**Expected keywords present?**

**Hallucination detected?**

**Pass/Fail:**

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
[paste output here]
```

**Expected keywords present?**

**Hallucination detected?**

**Pass/Fail:**

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
[paste output here]
```

**Expected keywords present?**

**Hallucination detected?**

**Pass/Fail:**

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
| Tests passed | 2 / 12 (10 pending) |
| Hallucinations detected | 0 so far |
| Refusal cases correct | 1 / 1 so far (T2 pass; T4, T6, T9 pending) |
| Count accuracy | pending (T5, T10) |

## Fixes applied during evaluation

| # | Finding | Agent | Change made | Result |
|---|---|---|---|---|
| 1 | Identical prompt produced differing goal lists across runs | Planner | Temperature lowered to 0.2 | Pending re-test |
