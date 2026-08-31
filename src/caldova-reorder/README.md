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

| Path | File |
| --- | --- |
| Data model | [`rayfin/data/RestockRequest.ts`](rayfin/data/RestockRequest.ts) |
| Where "running low" is read from | [`src/queries/regional-dashboard/low-stock-queue.dax`](src/queries/regional-dashboard/low-stock-queue.dax) |
| The reorder function | [`rayfin/functions/src/function_app.ts`](rayfin/functions/src/function_app.ts) |

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
