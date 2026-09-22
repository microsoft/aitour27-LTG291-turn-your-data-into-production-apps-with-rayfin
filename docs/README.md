# Deploy the Caldova demo

This guide deploys the Fabric data assets, semantic model, and Rayfin application
used in LTG291. The scripts create named demo items inside an existing workspace;
they do not create or delete the workspace.

## Prerequisites

- A Microsoft Fabric workspace you can deploy into
- Capacity assigned to that workspace
- Node.js and npm
- Azure CLI, signed in to the target tenant
- Bash on macOS/Linux or PowerShell on Windows
- Permission to create Fabric items and deploy the Rayfin app

The root deployment scripts install the `fabio` helper when it is missing. Review
that external installer behavior before running the scripts in a restricted
environment. The scripts never sign in for you: on the first run, let the dry
run install `fabio` if needed, then run `fabio auth login --browser` and repeat
the deployment command.

## 1. Configure the Fabric deployment

Copy the environment template and fill in your workspace:

```bash
cp .env.example .env
```

Set either `FABRIC_WORKSPACE_ID` or the exact `FABRIC_WORKSPACE_NAME`. If both
are set, they must identify the same workspace. Leave generated item IDs blank
on the first run.

## 2. Deploy the Rayfin app

The semantic model reads the app's mirrored SQL database, so deploy the app
first:

```bash
cd src/caldova-reorder
npm ci
npx rayfin login
RAYFIN_FEATURE_FLAGS=functions,connectors npx rayfin up
```

Find the SQL database and SQL endpoint created for the app:

```bash
fabio item list --workspace <workspace> --all
```

Add their IDs to the root `.env` as `RAYFIN_SQL_DATABASE_ID` and
`RAYFIN_SQL_ENDPOINT_ID`.

## 3. Deploy the Fabric data and semantic model

From the repository root:

```bash
./deploy.sh --dry-run
./deploy.sh
```

On Windows:

```powershell
./deploy.ps1 -DryRun
./deploy.ps1
```

The deployment loads the generated CSV data into Delta tables, deploys the
Direct Lake semantic model, binds the app's mirrored SQL database, refreshes the
model, and runs smoke-test queries.

## 4. Configure the app connector

Open `src/caldova-reorder/rayfin/rayfin.yml` and replace:

- `<fabric-workspace-id>` with your Fabric workspace ID
- `<semantic-model-item-id>` with the deployed semantic model ID

Rayfin requires literal IDs in connector configuration; environment-variable
placeholders are not supported for these fields. Redeploy the app after changing
the connector:

```bash
cd src/caldova-reorder
RAYFIN_FEATURE_FLAGS=functions,connectors npx rayfin up
```

## 5. Open or develop the app

The application runs embedded in the Fabric portal. Open the deployed app item
in the target workspace.

For local frontend development:

```bash
cd src/caldova-reorder
npm run dev
```

Append `&devUri=http://localhost:5173` to the Fabric app URL so the portal shell
loads the local frontend while preserving Fabric SSO.

## Reset the demo

- Double-click the Caldova wordmark in the app to remove reorders created by the
  signed-in presenter.
- Run `./deploy.sh --reset` to remove the named semantic model and lakehouse.
  The script leaves the workspace and Rayfin app in place.

## Keep local deployment state private

Files matching `.env*` and `.deployments.*` are ignored because they can contain
workspace IDs, item IDs, deployment URLs, access tokens, or publishable keys.
Do not include them in release archives or support bundles.
