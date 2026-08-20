# Caldova demo runbook

Executable talk notes for **AI Tour LTG291 / “Turn your data into production apps with Rayfin”**.

## Locked narrative

- **Company:** Caldova, fictional pharma company; we demo the **pharmacy / drugstore retail arm** only.
- **Persona:** store / regional manager.
- **Read:** governed OTC low-stock / underperforming SKUs from a **Fabric semantic model**.
- **Write:** manager clicks **Request restock**; the app writes a governed record back into the same Fabric estate.
- **Act One punch:** today this lives in store-by-store Excel/shadow apps; Rayfin closes the prototype→production gap on the shared data estate from day one.

## Beat timing (do not change)

1. **Beat 1 — Copilot bootstrap from `start.md`** · **2 min**
2. **Beat 2 — Semantic model → working app** · **3 min**
3. **Beat 3 — Governed write-back** · **2 min**

---

## One-time preparation (offstage)

```bash
cd /Users/sinedied/projects/aitour-from-data-to-apps
cp .env.example .env
node --version
fabio --version
./script.sh --help
fabio auth login
```

Notes:

- Keep the default friendly names from `.env` unless you intentionally need different ones.
- If you must pin a Fabric capacity, use `--capacity <id>` on the live run instead of changing the narrative.
- `./script.sh` recreates its local `.script-workdir` scratch area on every run and removes it when done.

## Preflight / dry-run / live provisioning

### Preflight

```bash
cd /Users/sinedied/projects/aitour-from-data-to-apps
./script.sh --help
```

### Dry run (safe, local-only, no Fabric mutations)

```bash
cd /Users/sinedied/projects/aitour-from-data-to-apps
./script.sh --dry-run
```

### Live provisioning

```bash
cd /Users/sinedied/projects/aitour-from-data-to-apps
./script.sh 2>&1 | tee demo-live.log
```

### Live provisioning with explicit capacity

```bash
cd /Users/sinedied/projects/aitour-from-data-to-apps
./script.sh --capacity <fabric-capacity-id> 2>&1 | tee demo-live.log
```

What the live run really does:

- requires the configured **existing workspace** and aborts if it is missing or mismatched
- creates or reuses the exact named **lakehouse**
- regenerates deterministic CSVs and overwrites **stores / products / inventory / sales**
- tries to bootstrap `restock_requests` safely
- creates or updates the semantic model and waits for DAX smoke queries
- deploys with `npx rayfin up`
- prints **Workspace**, **Lakehouse**, **Semantic model**, **Rayfin app backend**, **Rayfin API**, and **Rayfin hosting URL**

## Capture and open the URLs you need

Run the live provision with `tee demo-live.log`, then capture the printed URLs:

```bash
cd /Users/sinedied/projects/aitour-from-data-to-apps
APP_PORTAL_URL="$(grep 'Rayfin app backend:' demo-live.log | awk -F' \\| ' '{print $2}')"
APP_HOSTING_URL="$(grep 'Rayfin hosting URL:' demo-live.log | sed 's/^.*Rayfin hosting URL: //')"
WORKSPACE_URL="$(grep 'Workspace:' demo-live.log | awk -F' \\| ' '{print $2}')"
LAKEHOUSE_URL="$(grep 'Lakehouse:' demo-live.log | awk -F' \\| ' '{print $2}')"
MODEL_URL="$(grep 'Semantic model:' demo-live.log | awk -F' \\| ' '{print $2}')"
printf 'APP_PORTAL_URL=%s\nAPP_HOSTING_URL=%s\nWORKSPACE_URL=%s\nLAKEHOUSE_URL=%s\nMODEL_URL=%s\n' "$APP_PORTAL_URL" "$APP_HOSTING_URL" "$WORKSPACE_URL" "$LAKEHOUSE_URL" "$MODEL_URL"
open "$APP_PORTAL_URL"
open "$LAKEHOUSE_URL"
open "$MODEL_URL"
```

Use them like this:

- **`APP_PORTAL_URL`** = the real Beat 2 / Beat 3 demo URL inside Fabric
- **`APP_HOSTING_URL`** = useful to keep, but opening it directly is **not** the live demo path because the app expects the Fabric embed/auth flow
- **`LAKEHOUSE_URL`** = the 5-second Fabric proof target

If the log is missing but `.env` is current, recover the Fabric URLs with:

```bash
cd /Users/sinedied/projects/aitour-from-data-to-apps
set -a && source ./.env && set +a
fabio workspace url --id "$FABRIC_WORKSPACE_ID" --output plain
fabio item url --workspace "$FABRIC_WORKSPACE_ID" --id "$FABRIC_LAKEHOUSE_ID" --type Lakehouse --output plain
fabio item url --workspace "$FABRIC_WORKSPACE_ID" --id "$FABRIC_SEMANTIC_MODEL_ID" --type SemanticModel --output plain
```

---

## Beat 1 — Bootstrap with Copilot from `start.md` · 2 min

Goal: show the **agentic bootstrap**, not a full live build.

1. Start in Copilot CLI in the repo root.
2. Paste the current `start.md` guided setup prompt from the Rayfin repo.
3. Answer it with:
   - **context:** Caldova pharmacy operations app
   - **workspace:** `caldova-demo-workspace`
   - **semantic model:** `caldova-pharmacy-model`
4. Let Copilot get to the plan / scaffold handoff:
   - detects the Fabric target
   - chooses the **`dataapp`** path
   - proposes the app plan instead of dropping you onto a blank page
5. **Stop there on purpose.**

Talk track handoff:

> “Copilot got us from blank page to a real Rayfin plan. To stay on the clock, I’m switching to the already provisioned build that points at the same Fabric workspace and semantic model.”

## Beat 2 — Semantic model → working app · 3 min

**Precise switch:** leave the Copilot terminal and switch to the already-open **`APP_PORTAL_URL`** browser tab.
Do **not** switch to localhost.
Do **not** use the raw hosting URL for the live demo path.

Show, in order:

1. **Fabric SSO** lands you in the deployed app.
2. The header shows **Signed-in operator**.
3. The dashboard shows:
   - hero KPIs
   - **Stores under pressure**
   - **Category risk mix / category burden**
   - **Hero low-stock SKUs**
4. Land on the grid and set up Beat 3.

Optional offstage redeploy check, never the on-stage default:

```bash
cd /Users/sinedied/projects/aitour-from-data-to-apps
./script.sh 2>&1 | tee demo-live.log
```

## Beat 3 — Live row-selection → Request restock · 2 min

1. In **Hero low-stock SKUs**, single-select a critical row.
2. Show that the **Live selection** panel appears.
3. Show that the right-side **Request governed restock** workbench is now prefilled with:
   - **Store ID**
   - **SKU**
   - **Suggested quantity**
4. Optionally add a short note.
5. Click **Request restock**.
6. On success, show:
   - **Request ID**
   - **Status = submitted**
   - **Requested by**
   - **OneLake target**

What actually happened:

- the function used the delegated session identity
- it wrote an **immutable JSON file** into **Lakehouse Files**
- it did **not** append directly into a Delta table

### 5-second Fabric proof (truthful version)

Switch to the lakehouse tab and show the file landing path from the app result:

```text
Files/restock-requests/requests/status=submitted/requested_date=YYYY-MM-DD/store_id=<lowercase-store-id>/sku=<lowercase-sku>/<timestamp>_<requestId>.json
```

Say this explicitly:

> “This proves the governed write landed in OneLake Files. This repo does not provision a Files→Delta ingestion job, so I’m not claiming an immediate Delta/table append.”

If you need a shorter line:

> “Governed write landed in OneLake now; Delta materialization is a separate Fabric ingestion step.”

---

## Recovery / fallback paths

### 1) Fabric auth hiccup

- If `fabio` auth expires before provisioning:

```bash
cd /Users/sinedied/projects/aitour-from-data-to-apps
fabio auth login
```

- If the app shows **“Can’t open this app outside Fabric”**, you opened the wrong URL. Re-open **`APP_PORTAL_URL`**, not localhost and not the raw hosting URL.

### 2) Connector / deployment-only local errors

If you see messages like:

- `The delegated Fabric semantic-model connector only runs inside a deployed Fabric app...`
- `Missing required env vars for creating rayfin client - run 'npx rayfin up'`
- `Missing required env vars for Fabric auth - run 'npx rayfin up'`

Then do **not** debug local on stage. The read path is deployed-only by design. Switch to the pre-deployed **`APP_PORTAL_URL`**.

### 3) Failed live deploy

- If the live run fails during `rayfin up`, do not burn stage time fixing deployment.
- Use the last known good **`APP_PORTAL_URL`** from your most recent successful `demo-live.log`.
- Fix or rerun provisioning offstage:

```bash
cd /Users/sinedied/projects/aitour-from-data-to-apps
./script.sh 2>&1 | tee demo-live.log
```

### 4) Semantic refresh lag

The script already waits for semantic-model smoke queries before it finishes. If the app still looks stale right after a rebuild:

- wait 30-60 seconds
- refresh the browser tab once
- if needed, rerun the live provision offstage

### 5) Write permission failure on Beat 3

If the submit error says the signed-in manager does not have delegated write access to the Caldova Lakehouse Files area:

- switch to an account with Lakehouse Files write permission in that workspace, or
- stop at the prefilled workbench + landing-path preview and say the environment is read-only for this user

Do **not** claim the write succeeded if the file was not created.

### 6) Reduced-model restock-table mode

If the provisioning summary says:

```text
restock_requests Delta target: not provisioned; semantic model used the reduced definition
```

Then:

- Beat 2 still works for the main low-stock dashboard
- Beat 3 still works for the **file-based** write-back proof
- do **not** promise that `restock_requests` is queryable from the semantic model or already appended to Delta

---

## Talk-day checklist

- [ ] `fabio auth login` already completed
- [ ] `./script.sh --dry-run` completed cleanly
- [ ] latest successful live run saved as `demo-live.log`
- [ ] `APP_PORTAL_URL` opens the deployed app inside Fabric
- [ ] `LAKEHOUSE_URL` is open in a second tab for the 5-second proof
- [ ] app loads with Fabric SSO and shows live Caldova metrics
- [ ] one test restock request succeeded with the speaker account
- [ ] you know which **Hero low-stock SKU** row you will click first
- [ ] if using capacity reassignment, the capacity ID is ready
- [ ] Beat 1 terminal is ready with the current `start.md` prompt

---

## Reset / rebuild

Safe reset:

```bash
cd /Users/sinedied/projects/aitour-from-data-to-apps
./script.sh --reset
```

What `--reset` removes:

- the exact named **Rayfin app backend**
- the exact named **semantic model**
- the exact named **lakehouse**

What `--reset` intentionally leaves in place:

- the **workspace**

Full rebuild after reset:

```bash
cd /Users/sinedied/projects/aitour-from-data-to-apps
./script.sh --dry-run
./script.sh 2>&1 | tee demo-live.log
```

Full rebuild after reset with capacity:

```bash
cd /Users/sinedied/projects/aitour-from-data-to-apps
./script.sh --dry-run
./script.sh --capacity <fabric-capacity-id> 2>&1 | tee demo-live.log
```

Bottom line:

- the local scratch workdir is safe to rerun
- the Fabric **workspace remains**
- the named **app / model / lakehouse** are the only destructive reset targets
