# Mira — AI-Powered Project Intelligence Assistant

Mira is a multi-agent n8n workflow that drafts project plans, risk matrices, status reports and milestone digests for Nexora Pvt. Ltd.'s PM/TPMs, grounded strictly in a project's own files. Built for the capstone *Applied Agentic AI for PMs/TPMs* using the ABCDE Ltd. AI Adoption Project data.

The design rule: **Mira never guesses.** Every fact must cite a source file and row/phase ID, every count and date is computed in code (not by the LLM), and every agent refuses with `INSUFFICIENT_INPUT` rather than inventing content.

## Architecture

A Router classifies each request and sends it to exactly one specialist, or refuses it.

```
Request + file manifest
        │
  Router (gpt-4o-mini, temp 0) ── INSUFFICIENT ──> refusal naming what is missing
        │
   Switch on target_agent
   ├── Planner            project plan from description + timeline
   ├── Risk Assessor      categorized risk matrix from the risk register
   ├── Status Reporter    weekly status from precomputed task-board figures
   └── Milestone Tracker  upcoming / at-risk milestones and blocked tasks
```

Counting, sprint filtering and date arithmetic run in a deterministic Code node (`workflows/data_prep_code_node.js`). The agents only narrate the figures they are given. All five LLM-calling components send traces to Langfuse.

Diagram: [`docs/Mira_Architecture_Diagram_v2.png`](docs/Mira_Architecture_Diagram_v2.png)

## Results

- **12 / 12** baseline tests pass, with **0** confirmed hallucinations (including 4/4 refusal cases).
- Five defects found and fixed during evaluation; all were wiring or prompt-completeness issues, none were fabricated facts.
- Estimated cost: about $0.0006 per request, roughly $0.37 per PM per month at 20 requests a day (gpt-4o-mini).

Full detail: [`docs/Baseline_Test_Results.md`](docs/Baseline_Test_Results.md)

## Repository layout

| Path | Contents |
|---|---|
| `workflows/` | Exported n8n workflows: `Router.json`, `Planner.json`, `Risk_Assessor.json`, `Status_Reporter.json`, `Milestone_Tracker.json`, plus `data_prep_code_node.js` |
| `data/` | The ABCDE Ltd. input files: project description, timeline, risk register, sample task board, baseline test inputs |
| `docs/Mira_Architecture_Writeup.docx` | Q2 architecture writeup (tools, pattern, agents, cost, metrics, testing) |
| `docs/Mira_Program_Charter_Q3.docx` | Q3 program charter |
| `docs/Mira_Reflection_Q4.docx` | Q4 reflection and next steps |
| `docs/Mira_Capstone_Deck.pptx` | Slide deck: problem, approach, outcomes |
| `docs/Baseline_Test_Results.md` | All 12 baseline tests with inputs, outputs, and fixes |
| `docs/Mira_Agent_System_Prompts.md` | System prompts for every agent |
| `docs/Mira_BRD_v1.docx`, `docs/Mira_Q1_Ideation.docx` | Business requirements and Q1 ideation |
| `docs/screenshots/` | Canvas, in-action and Langfuse trace screenshots, with a captioned index |

## Running it

Requires a self-hosted n8n instance, an OpenAI API key, and (optionally) a Langfuse project.

1. Import the four specialist workflows first (`Planner`, `Risk_Assessor`, `Status_Reporter`, `Milestone_Tracker`), then `Router.json`.
2. In n8n, create your own credentials: an **OpenAI** credential for the chat model nodes, and (for tracing) an **HTTP Basic Auth** credential using your Langfuse public key as the username and secret key as the password. No keys are stored in this repo.
3. The file-read nodes point at `C:/Users/Mrosh/.n8n-files/`. Copy the files from `data/` into a folder of your choice and update the file paths in each workflow.
4. In `Router`, re-select the workflow in each **Execute Sub-workflow** node. Workflow IDs differ per n8n instance.
5. The tracing HTTP Request nodes post to `https://us.cloud.langfuse.com/api/public/ingestion`. Change the host if your Langfuse project is in another region, or delete the tracing branches to run without Langfuse.
6. Open `Router`, set `requestText` in the first Edit Fields node (for example `Give me a status report for the project`), and click **Execute workflow**.

## Known limitations

- Langfuse cost and token figures understate real usage, and latency reads 0.00s, because the tracing payload sends placeholder input and identical start/end times. Real token counts in the writeup come from a logged run plus measured prompt lengths.
- The tracing node currently sits last in each specialist, so the Router receives the Langfuse response rather than the generated report. The report is visible in each specialist's own execution.
- The Milestone Tracker has no Overdue section in its output template, so overdue tasks are not surfaced by that agent (the Status Reporter does report them).
- Top-N risk ranking is positional, since the risk register has no severity field.

These and the planned fixes are covered in the Q4 reflection.
