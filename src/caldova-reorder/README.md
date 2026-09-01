# Caldova restock

The app a Caldova regional manager uses to see what is running low across their
stores and send a reorder to purchasing. Built with [Rayfin](http://aka.ms/rayfin/docs)
on top of the `caldova-operations` semantic model in [`../fabric/`](../fabric/).

## How it hangs together

**Reads** go through the Rayfin `fabric-semanticmodel` connector, declared as
`caldovaModel` in [`rayfin/rayfin.yml`](rayfin/rayfin.yml):

```ts
client.connectors.caldovaModel.executeQuery({ query })
```

The connector runs with **delegated** auth, so the model's `RegionalManager`
row-level security scopes every query to the signed-in manager's region. The app
never filters by region itself.

The model answers in Apache Arrow, so the client is constructed with the
connector's runtime (`fabricSemanticModel()`) registered under the same name —
see [`src/lib/rayfin-client.ts`](src/lib/rayfin-client.ts). That runtime decodes
the response and returns a normalised `{ status, table }` result, so app code
never touches the wire format.

Every number on screen is a model measure — `Days of Stock`, `Is Low Stock`,
`Suggested Reorder Units`, `Reorders Sent Today`. Change a definition in the
semantic model and this app changes with it, with no code edit here. The DAX
lives in [`src/queries/regional-dashboard/`](src/queries/regional-dashboard/).

**Writes** go through a function, never a direct client write:

```ts
client.functions.sendReorder.invoke({ storeId, sku, units })
```

[`rayfin/functions/src/function_app.ts`](rayfin/functions/src/function_app.ts)
does two things: it calls Caldova's purchasing system, then records the request
with who asked and when. The identity comes from the session token, not from the
caller.

Purchasing itself is stood in by a second function, `purchaseOrders`
([`purchasing-mock.ts`](rayfin/functions/src/purchasing-mock.ts)), hosted in the
same workspace. The outbound call is therefore a real HTTP round trip — real
client, real request shape, real error handling — with nothing outside Fabric to
depend on at a venue. Point `PURCHASING_API_URL` at the real system to switch.

The recorded request lands in the app's own Fabric SQL database. Fabric mirrors
that into OneLake as Delta, and the semantic model reads it with Direct Lake — so
a reorder shows up in the app, the regional dashboard and analytics as one number.

## Deciding how many to order

Clicking a row opens a detail view with the three things that turn a suggested
quantity into a decision: what the product actually sells here and across the
region (last 7 or 28 days), how much cover is left, and how stock has moved in
**every** shop over the past week — fifteen small multiples, worst cover first,
this shop in bold.

`Inventory` is a snapshot with no history, so the stock curves are *reconstructed*:
today's count plus everything sold since. That assumption — no deliveries in the
window — is stated on screen and in each measure's description. The measures
themselves live in the semantic model (`Estimated Stock`,
`Estimated Days of Stock`, `Estimated Products Running Low`, `Avg Daily Sales`),
not in this app, so a report or a notebook asking the same question gets the same
answer. Over the model's own 28-day window `Avg Daily Sales` reproduces
`Avg Daily Demand` exactly.

The "products running low" tile plots that same reconstruction, so the chart and
the number above it are finally the same quantity — the last point of the trend
*is* the tile's number.

| Path | File |
| --- | --- |
| Data model | [`rayfin/data/RestockRequest.ts`](rayfin/data/RestockRequest.ts) |
| Where "running low" is read from | [`src/queries/regional-dashboard/low-stock-queue.dax`](src/queries/regional-dashboard/low-stock-queue.dax) |
| The reorder function | [`rayfin/functions/src/function_app.ts`](rayfin/functions/src/function_app.ts) |
| Product detail | [`src/components/product-detail.component.tsx`](src/components/product-detail.component.tsx) |

## Why the screen moves before the model does

Fabric mirrors the app's database into OneLake, and the semantic model reads that
copy. The mirror takes roughly half a minute — far too long to leave the screen
still after a manager acts.

So a sent reorder is held in [`use-pending-reorders`](src/hooks/use-pending-reorders.tsx)
and painted immediately: the row flips to **On order**, the tile increments, the
row appears in recent reorders. Each pending entry is dropped the moment the
model reports its `requestId`, so nothing is ever counted twice. Nothing is
invented — the app is anticipating an answer it already knows the model will give.

A reorder does not restock the shelf, so `Days of Stock` deliberately does **not**
change on send. The row's honest state change is "On order".

That badge is **not** session state. It comes from the model's own
`Open Restock Requests` measure — sent to purchasing, not yet fulfilled — so it
survives a refresh, and a colleague's open request stops you double-ordering
too. Pending only fills the half-minute before the model has mirrored a reorder
just sent from this screen, and a pending entry is released only once the model
reports it in *both* places it is painted, so the badge never blinks off.

## Where row-level security lives

`RestockRequest` carries no database policy, on either action. Two reasons, both
recorded on the entity:

- Data API Builder cannot apply one to `create` — an INSERT has no WHERE clause
  to attach it to.
- A `read` policy would have to match on `claims.sub`, and the Fabric-brokered
  session token does not carry that claim. Data API Builder applies read rules to
  the row a mutation returns, so an unevaluable policy breaks the **write** too.

Neither is a gap. Writes only ever happen inside `sendReorder`, which takes the
requester from the signed-in identity rather than from the caller, so a reorder
cannot be attributed to somebody else. And what a manager *sees* is scoped by the
semantic model's own `RegionalManager` row-level security — which is the point
the session is making: the rule lives in the model, once.

## Running it

```bash
npm install
npm run dev
```

The app authenticates with Fabric SSO and **only runs embedded in the Fabric
portal**. Open the app item in the workspace and append `&devUri=http://localhost:5173`
to point the shell at your local dev server.

## Deploying

```bash
npx rayfin login
npx rayfin up
```

`rayfin up` deploys the frontend, the function and the schema, and applies the
runtime settings in one step.

Two things this project needs that are still behind flags or non-default:

- Functions and connectors are preview features — export
  `RAYFIN_FEATURE_FLAGS=functions,connectors` for the CLI to see them.
- If the workspace is on a non-production ring, point the CLI at it with
  `RAYFIN_FABRIC_API_URL`, and supply a matching token via `RAYFIN_TOKEN`
  (for example from `az account get-access-token --resource https://api.fabric.microsoft.com`).

The Rayfin packages are pinned to the `1.35.0-alpha.*` preview line. Install with
`npm ci` so the lockfile decides the versions — a plain `npm install` can pull a
newer alpha, and this line still makes breaking changes between builds.

No secrets are required: `PURCHASING_API_URL` is optional and falls back to the
stood-in endpoint in this workspace. To point at a real purchasing system, set
`RAYFIN_SECRET_PURCHASING_API_URL` in `rayfin/.env` and run `npx rayfin secret set`.

After deploying, copy the app's SQL database and SQL endpoint ids into the repo
root `.env` as `RAYFIN_SQL_DATABASE_ID` and `RAYFIN_SQL_ENDPOINT_ID` so the
semantic model deploy can bind to them.
