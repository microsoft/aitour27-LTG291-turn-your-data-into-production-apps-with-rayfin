# Caldova semantic model

The Fabric semantic model behind the LTG291 demo. It is where Caldova's numbers are *defined* — the app, the regional dashboard and any analytics all read the same definitions from here, which is why their numbers cannot disagree.

## What is in here

| Path | Purpose |
| --- | --- |
| `caldova-operations.SemanticModel/` | The model definition, in TMDL (required for Direct Lake) |
| `dax/` | Queries used to smoke-test the deployment, and handy to run on stage |

The model reads five Delta tables in the lakehouse, loaded from `data/generated/`:

| Model table | Delta table |
| --- | --- |
| `Stores` | `stores` |
| `Products` | `products` |
| `Inventory` | `inventory` |
| `Sales` | `sales` |
| `RestockRequests` | `restock_requests` |

## The definitions that matter

Every measure lives in the model, not in application code. Change one here and every consumer changes with it, with no redeploy.

| Measure | What it means |
| --- | --- |
| `Latest Sales Date` | The most recent day the sales data covers. The model's own notion of "now". |
| `Avg Daily Demand` | Units sold per day over the trailing 28 days, for this product in this store. |
| `Days of Stock` | On-hand units divided by average daily demand. The number the low-stock queue is ranked by. |
| `Low Stock Threshold Days` | **7.** Caldova's definition of "running low". |
| `Is Low Stock` | Whether this product in this store is below that threshold. |
| `Stock Status` | `Critical`, `Low` or `Healthy` — urgency as a word, so it does not depend on colour. |
| `Products Running Low` | How many product-store combinations are running low. |
| `Stores Under Pressure` | How many stores have at least one product running low. |
| `Suggested Reorder Units` | The quantity to pre-fill on a reorder, to restore `Target Cover Days` plus safety stock. |
| `Reorders Sent Today` | Requests made today, in UTC. Reads zero before the first reorder of the day. |
| `Open Restock Requests` | Requests sent to purchasing but not yet fulfilled. |

Demand is anchored on `Latest Sales Date` rather than `TODAY()` on purpose. The generated sales window is fixed, so by demo day it is already in the past; anchoring keeps `Days of Stock` meaningful whenever the model is queried. `Reorders Sent Today` is the deliberate exception — it uses the real current date, so the tile reads `0` at the start of the demo and moves the moment a live reorder lands.

## Row-level security

The model defines a `RegionalManager` role that scopes `Stores` to the regions the signed-in user manages, matched on `manager_upn` against `USERPRINCIPALNAME()`. This is where "a manager sees only their own region" belongs — in the model, not in the app.

The role ships **unassigned**, so it has no effect until someone is added to it. To try it:

```
fabio semantic-model add-role-member --workspace <workspace> --id <model> --role RegionalManager --member <upn>
```

Assign it only to a test identity that exists in `stores.csv`. A user who manages no store will see an empty model.

## Deploying

Use `deploy.sh` (macOS, Linux) or `deploy.ps1` (Windows) from the repository root. Both do the same thing: load the CSVs into Delta tables, bind this model to the lakehouse, deploy it, refresh it to frame Direct Lake, and smoke-test it.

```bash
cp .env.example .env     # then fill it in
./deploy.sh --dry-run    # check everything locally first
./deploy.sh
```

```powershell
Copy-Item .env.example .env
./deploy.ps1 -DryRun
./deploy.ps1
```

The scripts require an existing workspace and never create or delete one. They also never sign you in — authenticate fabio yourself first and they will check with `fabio auth status`.

### Storage mode

`FABRIC_MODEL_STORAGE_MODE` in `.env` decides how the model reads the lakehouse:

- `onelake` (default) — Direct Lake straight onto the OneLake Delta files. Recommended, and keeps the SQL analytics endpoint off the critical path.
- `sql` — Direct Lake through the SQL analytics endpoint. The fallback if the OneLake binding misbehaves.

`definition/model.tmdl` carries a `{{DATABASE_QUERY_SOURCE}}` placeholder that the deploy script fills in with the right source for the chosen mode. The committed definition is therefore not directly deployable by hand — deploy through the script.

### Non-production rings

A workspace on a ring like `daily.powerbi.com` is invisible from the production Fabric endpoint and reports as `WorkspaceNotFound`. Point fabio at the right ring with the `FABIO_*` settings in `.env`. For the daily ring:

```
FABIO_FABRIC_API_ENDPOINT=https://dailyapi.fabric.microsoft.com/v1
FABIO_POWERBI_ENDPOINT=https://dailyapi.powerbi.com/v1.0/myorg
FABIO_ONELAKE_DFS_ENDPOINT=https://daily-onelake.dfs.fabric.microsoft.com
FABIO_ONELAKE_BLOB_ENDPOINT=https://daily-onelake.blob.fabric.microsoft.com
FABIO_CLIENT_ID=04b07795-8ddb-461a-bbee-02f9e1bf7b46
```

All four endpoints matter, and they fail at different points: the Fabric API resolves the workspace, OneLake carries the CSV uploads, and the Power BI API performs the model refresh. Sign in with the Azure CLI client id before running the scripts:

```
export FABIO_CLIENT_ID=04b07795-8ddb-461a-bbee-02f9e1bf7b46
fabio auth login --browser
```

## Running the queries by hand

```
fabio semantic-model query --workspace <workspace> --id <model> --file src/fabric/dax/low-stock-queue.dax
```

- `smoke-test.dax` — one row proving every measure family answers. Run by the deploy script.
- `low-stock-queue.dax` — the worst-first list a regional manager acts on.
- `headline-tiles.dax` — the header tiles, plus the anchor date and threshold behind them.
- `recent-restock-requests.dax` — the governed reorder record, newest first.

## Resetting

```bash
./deploy.sh --reset
```

Deletes the named semantic model and lakehouse, and nothing else. The workspace is always left in place.
