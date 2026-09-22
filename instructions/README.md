# Attendee instructions

This repository accompanies **LTG291: Turn your data into production apps with
Rayfin**. You can use it during the guided session or explore the complete demo
at your own pace.

## Follow the session

1. Start with the [session overview](../README.md).
2. Review how the [Fabric semantic model](../src/fabric/README.md) defines the
   business metrics used by every consumer.
3. Review how the [Caldova app](../src/caldova-reorder/README.md) reads those
   definitions and records reorder actions.
4. Follow the write path from
   [`sendReorder`](../src/caldova-reorder/rayfin/functions/src/function_app.ts)
   to the purchasing client and the `RestockRequest` entity.
5. Compare the governed read and write paths: the application does not copy the
   semantic-model logic or trust browser-supplied identity.

## Run your own copy

The demo requires access to a Microsoft Fabric workspace and cannot run as a
standalone local application. Use the [deployment guide](../docs/README.md) to:

1. Deploy the Rayfin app and obtain its SQL database IDs.
2. Deploy the Caldova lakehouse and semantic model.
3. Configure the app's semantic-model connector with your own workspace and
   model IDs.
4. Open the app through the Fabric portal, optionally pointing it at a local
   development server.

## Key ideas to look for

- The semantic model owns the definition of “running low.”
- Delegated identity scopes reads and attributes reorder actions.
- The function is the boundary for the external purchasing call.
- The reorder record lands in Fabric, where analytics can consume it without a
  separate copy pipeline.
- The app can respond immediately while Fabric mirroring catches up.

Presenter notes and re-delivery guidance are in
[`delivery-resources/`](../delivery-resources/README.md).
