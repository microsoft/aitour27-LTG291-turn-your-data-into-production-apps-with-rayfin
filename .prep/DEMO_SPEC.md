# DEMO_SPEC — AI Tour LTG291: "Turn your data into production apps with Rayfin"

Build specification for the lightning-talk demo. See `demo.md` for the talk/demo flow detail and
`session.md` for the decision context. This file is the actionable plan.

## Goal
Build the **complete demo** in this repo, then a single local **`script.sh`** that provisions
everything inside an existing Fabric workspace (data + semantic model + deployed Rayfin app),
idempotently, so it can be rebuilt before/at the talk. The script must never create a workspace.

## Use case (locked)
**Caldova** — fictional pharma company; we demo its **pharmacy / drugstore retail arm** (OTC /
consumer-health). Retail-easy: no patient data, no regulated clinical decisions.
- **Persona:** store / regional manager.
- **Read:** OTC SKUs that are low-stock / underperforming per store, from a **Fabric semantic model**
  (days-of-stock, sell-through) — governed single source of truth.
- **Write-back:** manager clicks **"Request restock"** → a function writes the request back into
  Fabric, governed + analytics-ready.

## Demo beats (Act Two, 2+3+2 min) — full detail in `demo.md`
1. **Bootstrap with Copilot** from `start.md` (microsoft/rayfin PR #40) → `dataapp` template + plan.
2. **Semantic model → working app**: switch to the pre-deployed build; dashboard reads straight from
   the Fabric semantic model (Fabric SSO). Optional live `npx rayfin up`.
3. **Function write-back**: "Request restock" → function writes to Fabric (delegated identity);
   payoff in-app + a 5s flash of the data in Fabric (OneLake/SQL).

## Tech stack & key mechanisms
- **`fabio`** — agent-native Fabric CLI (single Rust binary, JSON output). All Fabric plumbing:
  existing-workspace lookup, `lakehouse create` + `upload-table` (CSV→Delta), semantic-model
  refresh/query, and `deploy`. Install: `curl -fsSL https://raw.githubusercontent.com/iemejia/fabio/main/install.sh | bash`.
- **Rayfin CLI** (`npx rayfin`) — app deploy (`rayfin up`).
- **Read path** = Rayfin **`fabric-semanticmodel` connector** (`@microsoft/rayfin-connector-fabric-semanticmodel`,
  experimental): declared in `rayfin.yml` under `connectors:` with `workspaceId` + `itemId` +
  `auth: delegated`; queried with **DAX** via `client.connectors.<name>.executeQuery({ query })`.
  **Only runs in a deployed Fabric app** (not local) — hence the pre-deployed build for Beat 2.
  Pattern reference: `~/projects/rayfin/samples/kitchensink` (`musicMarket` connector).
- **Semantic model** = **Direct Lake ⇒ TMDL** (confirmed via `fabio context schema SemanticModel`):
  a standard `.SemanticModel` item containing `definition.pbism` + `definition/model.tmdl` +
  `definition/tables/<Name>.tmdl` (columns, directLake partitions, DAX measures). Stage the target
  SQL analytics endpoint in the model, then deploy the complete item with `fabio deploy validate`,
  `fabio deploy plan`, and `fabio deploy apply`. Refresh to frame, then smoke-test with DAX.
  (`model.bim` cannot express Direct Lake.)
- **Write-back** = function writes a `restock_requests` Delta row into the **same Caldova Lakehouse**
  under delegated identity (pattern from `~/projects/rayfin/samples/functions` `writeFile`) → one
  Fabric artifact holds read + write, OneLake, analytics-ready.

## Repo layout
```
data/       synthetic data generator (Node, seeded) + generated CSVs
src/fabric/     TMDL Direct Lake semantic model (tables + DAX measures)
src/app/        Rayfin dataapp (connector + dashboard views + restock function + restock view)
src/script.sh   end-to-end provisioning orchestrator (+ --reset teardown)
src/.env.example
```

## Dataset (Caldova pharmacies)
- **Stores** (~15): `store_id, name, city, region, manager_upn`
- **Products** (~60 OTC SKUs): `sku, name, category, unit_price, pack_size`
  (categories e.g. Pain relief, Cold & flu, Vitamins, Allergy, Digestive, First aid)
- **Inventory** (store×sku): `store_id, sku, on_hand_qty, reorder_point, safety_stock`
- **Sales** (daily, ~10 weeks): `date, store_id, sku, units_sold, revenue`
- **restock_requests** (write target): `request_id, store_id, sku, qty, requested_by, requested_at, status`
- Seed a few **hero low-stock SKUs** (low days-of-stock) so the live "Request restock" moment is obvious.
- **DAX measures:** Units Sold, Avg Daily Sales, **Days of Stock**, **Sell-through %**, Low-stock flag.
- Generator must be **deterministic** (fixed seed) so re-runs reproduce the same hero SKUs.

## Build phases (with dependencies)
1. **repo-scaffold** — dirs, `.gitignore`, `.env.example`, README skeleton.
2. **build-dataset-gen** — Node seeded generator → CSVs incl. hero SKUs. *(needs 1)*
3. **define-dax-measures** — TMDL Direct Lake model in `fabric/` (tables + measures). *(needs 2)*
4. **scaffold-rayfin-app** — scaffold `dataapp` into `app/`, install deps. *(needs 1)*
5. **wire-connector-dashboard** — `fabric-semanticmodel` connector + dashboard views (DAX). *(needs 3,4)*
6. **build-restock-writeback** — restock function (write Delta row) + restock/status view. *(needs 4)*
7. **author-script-sh** — idempotent orchestrator (pipeline below) + `--reset` teardown. *(needs 2,3,5,6)*
8. **validate-locally** — data gen run, TMDL validate, app build+lint, `fabio ... --dry-run`. *(needs 2,5,6)*
9. **demo-runbook** — finalize `demo.md` run steps + talk-day checklist. *(needs 7)*

## `script.sh` pipeline (idempotent, local, device-code auth)
1. Ensure `fabio` + node; `fabio auth login` (device code).
2. Resolve the configured existing workspace ID or one unambiguous exact-name match; abort if it
   is missing or mismatched. Optionally assign capacity when explicitly configured.
3. `fabio lakehouse create` → capture lakehouse id + SQL Analytics Endpoint id.
4. Generate CSVs → `fabio lakehouse upload-table --format Csv` for Stores/Products/Inventory/Sales.
5. Stage the `.SemanticModel` item with the target SQL endpoint →
   `fabio deploy validate` → `fabio deploy plan` → `fabio deploy apply` → capture model id →
   `fabio semantic-model refresh` → validate with `fabio semantic-model query --dax "..."`.
6. Write workspace id + model id into `app/rayfin/.env` (FABRIC_WORKSPACE_ID / FABRIC_SEMANTIC_MODEL_ID);
   enable the `fabric-semanticmodel` connector block in `app/rayfin/rayfin.yml`.
7. `cd app && npx rayfin up` → deploy; print the app URL.
- `script.sh --reset`: delete the workspace (or its items) to re-run clean.

## Validation strategy
- **Local (no tenant):** data gen runs; CSV shapes correct; TMDL validates; app `build` + `lint`
  pass; `fabio ... --dry-run` for mutations.
- **Live (needs Fabric tenant + device-code auth):** run `script.sh`, capture real workspace/model
  IDs, sanity-check the dashboard reads and the restock write-back + 5s Fabric flash.

## Assumptions / open items
- An existing **Fabric workspace** is available. The script never creates one.
- A **Fabric capacity** is available (trial or assigned). `script.sh` takes optional `--capacity <id>`.
- Local runner authenticates **interactively (device code)**; SPN optional for CI (not needed).
- Write-back target = **Lakehouse Delta table** (revisitable to a Rayfin SQL entity).
- The `dataapp` template may need light adaptation; connector pattern mirrors kitchensink `musicMarket`.
- fabio pinned via its installer; verify command flags with `fabio <group> <sub> --help` and
  `fabio context schema <ItemType>` (do not assume — Fabric tooling shifts).
