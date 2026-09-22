# Delivery resources

Presenter, re-delivery, and train-the-trainer materials for this session.

## Core materials

| Item | Link | Notes |
|---|---|---|
| Delivery deck | [English](https://aka.ms/aitour27/LTG291/slides/en) | Required URL |
| Session recording | [YouTube](https://aka.ms/aitour27/LTG291/youtube) | Session recording |
| Attendee landing page | [Session README](../README.md) | Public starting point |
| Attendee instructions | [Instructions](../instructions/README.md) | Guided and self-paced path |
| Deployment guide | [Demo deployment](../docs/README.md) | Reproduce the demo environment |

## Delivery checklist

- Review the session README
- Review the attendee instructions
- Open the deck
- Review the presenter guidance below
- Review live demo reproducibility guidance
- Validate any required environment or setup

## Session preparation

- Open the deployed app through the Fabric portal and confirm Fabric SSO is
  still active.
- Confirm the signed-in manager sees only their region and at least three
  products are running low.
- Send one test reorder, confirm it appears in recent reorders, then reset it by
  double-clicking the Caldova wordmark and accepting the confirmation.
- Check that `https://aka.ms/rayfin/start.md` is reachable from the venue
  network.
- Keep the app loaded on the low-stock queue before the session starts.

For the live setup, use three windows:

1. A terminal opened in the demo folder.
2. The deployed app, signed in and ready on the low-stock list.
3. An editor with the data model, semantic-model query, and reorder function
   open in that order.

Use presentation-size fonts, disable notifications and sleep, and keep a
recording or screenshots ready for each live-demo segment.

## Run of show

The session is a 15-minute lightning talk:

| Segment | Duration | Delivery note |
|---|---:|---|
| Finished app and Caldova problem | 2 minutes | Show the outcome first and explain why the signal is hidden across stores and products. |
| Production gap and Rayfin | 3 minutes | Connect prototype speed to identity, access, governance, and audit requirements. |
| Prompt and scaffold | 2 minutes | Run the Rayfin starter prompt, show the generated project tree, then stop the long-running generation. |
| Governed read and action | 5 minutes | Show the semantic-model definition, send a reorder, and point out the immediate UI response and recorded action. |
| Architecture and takeaways | 2 minutes | Close with “Describe it. Ship it. Trust it.” |
| Buffer and evaluation | 1 minute | Leave room for switching delays and the evaluation ask. |

## Demo reproducibility

Follow the [deployment guide](../docs/README.md) to create the Fabric assets and
deploy the Rayfin app. The live demo should prove two connected paths:

1. Governed reads come from the Fabric semantic model through the delegated
   `caldovaModel` connector.
2. A reorder goes through a function, reaches the purchasing stand-in, and is
   recorded in the app's Fabric SQL database with the signed-in identity.

Fabric mirroring introduces a short delay before the semantic model reports the
new request. The app shows the pending reorder immediately and reconciles it
when the model catches up.

## Setup notes

- Do not debug a failed environment on stage; switch to the prepared recording.
- Keep the purchasing stand-in in the same workspace unless the external
  purchasing endpoint has been tested before the session.
- Reset presenter-created reorders between runs by double-clicking the Caldova
  wordmark.
- Reload the app and reopen the three walkthrough files before each delivery.

## Support

Content owner: [Yohan Lasorsa](https://github.com/sinedied)
