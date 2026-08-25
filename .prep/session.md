# Session context — LTG291 demo planning

> Internal talk-prep context. Keep out of any public release of this repo.
>
> This file is the current source of truth for the **session iteration**. Public docs explain the built
> repo; this file captures the talk promise, claim discipline, and what still has to change before the
> stage version is final.

## The talk (Microsoft AI Tour, FY27)
- **Session:** LTG291 — Core Lightning Talk, **Level 200**, **15 min**.
- **Conversation theme:** "Build a unified, governed data and AI estate".
- **Title (keep):** *Turn your data into production apps with Rayfin*.
- **Submitted abstract:** *Ship faster and decide with confidence. With Rayfin, every app you build
  with GitHub Copilot lands its data governed and analytics-ready in Microsoft Fabric, so you go from
  idea to a ready production app your whole org can trust, with no rewrite.*
- **Submitted objectives:** (1) move from intent to action, increase decision confidence; (2) see a
  code-first backend on Microsoft Fabric close the prototype-to-production gap with agentic
  engineering; (3) understand how apps built with GitHub Copilot produce governed, analytics-ready
  data from day one.
- Session owners: Anthony Bartolo, Kavita Makdani · author: Paul DeCarlo · this is Yohan's session.

## Current session promise
The talk now leads with **speed**: show the finished outcome first, then explain why speed usually dies
at production, then prove that Copilot + Rayfin keep the speed because the data, identity, and
governance rails are already attached.

Working line:

> This production app started with one prompt — and it stays trustworthy because it is already grounded
> in governed Fabric data and governed Fabric actions.

## The Caldova problem (locked scenario)

> Rewritten because the previous framing — one manager noticing one product running out in one shop —
> was solvable by walking down the aisle. If the audience can solve the problem without the app, the
> app looks unnecessary and Rayfin looks like plumbing nobody asked for.

**Who:** a **regional manager** responsible for **all 15 Caldova shops**, each carrying ~60 everyday
health products. That is **900 product-shop combinations**, built from ~63,000 sales rows, changing
every day.

**Why it is genuinely hard:**
- **Volume hides it.** Somewhere in those 900 combinations a handful are quietly about to run out, and
  a different handful are overstocked. Nobody scrolls 900 rows every morning.
- **Context creates the signal.** "Low stock" is not a number. Forty units of a fast seller in one shop
  is an emergency; ten units of a slow seller is fine. The signal only exists once stock is combined
  with how fast that product sells *in that shop*.
- **Both directions cost money.** Running out loses the sale and sends the customer elsewhere;
  over-ordering wastes stock that expires.
- **The last mile is ungoverned.** Caldova already has the data and read-only reports. To act, she
  exports to Excel, emails the supply team, and someone re-types it into another system. The numbers
  are governed right up until a decision is made — then the decision leaves the building, taking the
  audit trail, the shared definition of the numbers, and any record of who decided what.

**What Rayfin fixes, in the order the audience must feel it:**
1. **Makes the signal visible.** All 900 combinations are brought together and ranked, so the answer
   arrives in seconds instead of hiding in rows.
2. **Lets the decision happen in the same place.** She acts as herself, and the system knows who she is
   and which shops she may act for.
3. **Keeps the chain intact.** Data access, identity, the decision record, and the restock trigger are
   one secured chain. Break any link and the decision is no longer trustworthy.

**Already supported by the built app — no code change required.** The dashboard ranks the full
900-combination field, shows which shops and which categories are under pressure, and carries the
action. The scenario was under-described, not under-built.

**Rule for every future draft:** if the problem on screen could be solved by looking at a shelf,
sending an email, or opening one spreadsheet, it is the wrong problem.

## Preserved decisions that still hold
- **Use case = Caldova pharmacies (OTC retail).** Caldova is imposed (fictional pharma). We keep the
  **retail/OTC pharmacy** angle because it is easy and safe for a live demo: no patient data, no
  clinical decisions, but still a strong governance story. The scenario itself is locked above: a
  **regional manager over 15 shops and 900 product-shop combinations**, never a single obvious
  low-stock item.
- **Single thread:** scaffold → governed read → governed action.
- **Beat 1 uses `start.md`** from microsoft/rayfin PR #40 to show Rayfin/Fabric-aware planning and
  scaffold generation, then stops on purpose.
- **Beat 2 uses the pre-deployed Fabric app** because the delegated `fabric-semanticmodel` connector is
  deployed-only.
- **Provisioning stays automated via `fabio` + `npx rayfin`** behind one local `script.sh`.
- **Architecture reveal happens after the full demo loop**, not between the read and write beats.
- **“What Rayfin is” and “vibe-coding on rails” are one explanation**, not two separate sections.

## Exact 15-minute outline (locked)

| Time | Section | Purpose | Transition |
| --- | --- | --- | --- |
| 0:00–0:30 | **Dashboard tease** | Show the destination immediately: a real Caldova dashboard and one critical SKU already in view. | “This started with one prompt. Let me rewind to why that matters.” |
| 0:30–2:15 | **Caldova manager story** | Ground the problem in the regional manager: 900 product-shop combinations hide the signal, and even when she finds it the reports are read-only, so the decision escapes into Excel and email. | “So the question is: can we keep the prototype speed without losing the production rails?” |
| 2:15–3:20 | **Transformation mental model** | Show the mechanism: `Intent + governed Fabric data → Copilot + Rayfin guardrails → deployed app`. | “Here is the proof standard for the next seven minutes.” |
| 3:20–4:00 | **Proof setup** | Tell the audience what to watch for: describe the app, read governed data, act, and prove the action landed truthfully. | “First, blank page to real scaffold.” |
| 4:00–5:30 | **Plan + scaffold** | Prove the speed claim by showing `start.md`, Fabric/Rayfin detection, the plan, and visible generated scaffold/files. | “I’m stopping there on purpose and switching to the already provisioned build that points at the same Fabric assets.” |
| 5:30–8:30 | **Governed read** | Show the deployed Fabric app with SSO, hero KPIs, stores under pressure, category risk, and the hero low-stock queue. | “Now let’s close the loop on one actual decision.” |
| 8:30–11:00 | **Governed action** | Select the hero row, request restock under delegated identity, and prove the new record is immediately queryable in a Fabric table/entity. This is the final stage-ready outline; the current OneLake Files fallback does not satisfy this beat. | “That speed was not magic — here are the four blocks that made it work.” |
| 11:00–12:00 | **Four-block architecture + `rayfin.yml` snippet** | Give just enough credibility: Copilot plan, semantic-model connector, delegated function, Fabric estate. | “So what should people remember?” |
| 12:00–14:00 | **Describe it / Ship it / Trust it** | Close on the three verbs, one next action, and the evaluation ask. | “And this last minute is intentional buffer.” |
| 14:00–15:00 | **Buffer** | Protect the session from switching delays, proof latency, and recovery. | No new content. |

### Timing risks to control
- **Beat 1 sprawl:** do not let Copilot output reading turn into a tour of every generated file.
- **Beat 3 switching/proof:** keep the proof target ready; do not improvise a long Fabric navigation path.
- **Architecture overrun:** four blocks and one short `rayfin.yml` snippet only.

## Narrative spine
1. **Outcome first:** the audience sees a working production-style app before any explanation.
2. **Why the problem is hard:** the signal is buried in 900 combinations, and acting on it means
   leaving the governed estate for Excel and email.
3. **Why the app usually never ships:** real identity, shared data, and auditability kill the early
   speed.
4. **Mechanism:** Rayfin gives Copilot production-aware rails connected to governed Fabric assets.
5. **Proof:** blank page to scaffold, governed read, governed action.
6. **Credibility:** brief architecture reveal after the complete loop.
7. **Close:** **Describe it. Ship it. Trust it.**

## Still-valid technical findings
- **Rayfin read-from-Fabric = `fabric-semanticmodel` connector**, DAX `executeQuery`, delegated auth,
  **deployed-only**.
- **Delegated write uses the caller's identity from the token** and is bound to a **server-controlled
  target**, not browser-supplied target IDs.
- **Current write implementation lands immutable JSON in OneLake Files**, proving governed landing but
  **not** immediate queryable table/entity write.
- **`fabio`** still covers workspace, lakehouse, CSV→Delta uploads, semantic-model create/refresh/query,
  and deployment support around the demo.
- **Direct Lake semantic model requires TMDL**, not `model.bim`.

## Current repo/demo status (replaces the old handoff)
- The repo is **built**, not just planned:
  - deterministic synthetic dataset generator in `data/`
  - Direct Lake TMDL semantic model in `fabric/`
  - Rayfin app in `app/`
  - delegated restock workbench + function
  - idempotent `script.sh`
  - executable `demo.md` runbook
- **Beat 2 status:** the governed read story is real and should stay tied to the deployed Fabric app.
- **Beat 3 current truth:** the delegated write lands **immutable JSON in OneLake Files** under the
  configured Lakehouse Files path. That is a governed landing proof, **not** a claim of immediate
  Delta/table append or queryable semantic-model write-back.
- `script.sh` may bootstrap `restock_requests` table/model support when the environment allows it, but
  the talk must **not** depend on that until the queryable write-back gate below is passed.
- Live talk-day provisioning still requires Yohan's Fabric tenant and interactive auth.

## Submission alignment notes
- **Title:** keep as submitted.
- **Objective 1:** aligned with the manager going from low-stock insight to a restock action.
- **Objective 2:** aligned only if Beat 1 visibly reaches a scaffold, not just a plan.
- **Abstract / Objective 3:** overclaim until there is a **queryable** write-back path. If table/entity
  write is not ready, soften or drop “analytics-ready from day one” language in spoken framing.
- **Act One alignment:** merge “What Rayfin is” and “vibe-coding on rails” into the single mental-model
  explanation.
- **Close alignment:** replace any generic recap/resource-list ending with **Describe it / Ship it /
  Trust it**.

## Stage-readiness gate for Beat 3 (must be true before final claims)
Beat 3 is only fully stage-ready for the submitted analytics-ready claim when all of the following are
true:

1. the write uses the signed-in user's **delegated identity from the token**;
2. the destination is **server-bound**, not redirectable by browser input;
3. the written row includes:
   - `request_id`
   - `store_id`
   - `sku`
   - `qty`
   - `requested_by`
   - `requested_by_id`
   - `requested_at` (**UTC**)
   - `status = submitted`
   - optional `note`
4. the presenter can prove the new record by filtering on **`request_id` within 30 seconds**;
5. there is **no hidden Files→Delta step** required to make the proof true;
6. dashboard refresh is optional bonus proof, not the contractual success condition.

### Honest current wording

> The delegated write lands immutable JSON in OneLake Files, proving governed landing but not immediate
> queryable table/entity write.

Use that wording unless and until the gate above is satisfied.

## Where things live
- **This repo** (`aitour-from-data-to-apps`) — the demo project + docs. Work in **English** here.
  - `DEMO_SPEC.md` — actionable build plan.
  - `demo.md` — executable runbook for the current built demo.
  - `session.md` — internal session-iteration source of truth.
- `~/projects/advocacy/streams/aitour.md` — scratch: official prep-slide extract + outline drafts.
- `~/projects/rayfin/samples/{functions,kitchensink}` — Rayfin patterns to compare against.
- microsoft/rayfin PR #40 — `start.md` guided setup prompt used in Beat 1.
- `fabio` — https://github.com/iemejia/fabio (docs: https://ismaelmejia.com/fabio/).

## Deferred next iterations
- Implement and validate the **queryable** write-back path that satisfies the Beat 3 gate.
- Revalidate the complete demo live in the Fabric tenant with timing discipline.
- Once queryable write exists, sync `demo.md`, `DEMO_SPEC.md`, and any spoken/public wording to match.
- Design the slide sequence/graphics around the locked timing.
- Write and rehearse the speaker script; trim against real delivery time.
