# Turn your data into production apps with Rayfin — demo script

Live runbook. What you **do**; the speaker notes in `deck.md` are what you **say**.

Slide numbers refer to `deck.md`. pptx slide = deck.md slide + 1.

Paths marked `<!-- TODO: verify -->` are placeholders — replace with the real ones before the dry run.

---

## Preparation

**Before you leave the green room**

- Check `https://aka.ms/rayfin/start.md` returns content on the **venue network** — it 404s today and it is the first command of the demo
- `npx rayfin login` — confirm the session is live, not expired
- Confirm the deployed app opens: `https://<app>-app.rayfin.windows.net/` <!-- TODO: verify -->
- Sign in as Kate via Fabric SSO; confirm she sees **her region only**
- Confirm at least 3 products show under a week of stock; if not, reseed
- Run one throwaway reorder end to end, then delete it (see `## Reset`)

**Windows and layout**

- Window 1 — terminal, in the demo folder, cleared, prompt short
- Window 2 — the deployed app, signed in as Kate, **already loaded and scrolled to the low-stock list**
- Window 3 — editor, with these three files open as tabs, in this order:
  - data model with the entity decorators <!-- TODO: verify path -->
  - where the "running low" definition is read from the semantic model <!-- TODO: verify path -->
  - the reorder function <!-- TODO: verify path -->
- No purchasing window. No Fabric portal window. Three windows total.

**Legibility**

- Terminal font ≥ 18pt, editor font ≥ 18pt, browser zoom ≥ 125%
- Editor: minimap off, breadcrumbs off, terminal panel closed
- Light theme in the editor if the room is bright

**Silence the machine**

- Do Not Disturb on
- Quit mail, chat, calendar, notifications
- Disable screensaver and sleep
- Second display arranged so speaker notes are not mirrored

**Fallbacks**

- Recording of the cold open, cued to the low-stock list <!-- TODO: path -->
- Recording of the scaffolding run <!-- TODO: path -->
- Recording of the reorder, cued to just before send <!-- TODO: path -->
- Screenshots of the three walkthrough files, in case the editor misbehaves
- If the app is down: say *"I have this recorded, let me show you"* and switch. Do not debug on stage.

---

## Cold open — the finished app (slide 3, ~30s)

- Switch to **Window 2**, already warm
- Show the low-stock list across all of Kate's stores
- Point at one product with days-of-stock remaining
- **Do not send a reorder** — that is the slide 10 payoff
- Switch back to the deck

Audience should see: a real, populated app — not a loading spinner.

---

## Scaffolding from one prompt (slide 8, ~90s)

- Switch to **Window 1**
- Run:

```
copilot -i "$(curl -sSfL https://aka.ms/rayfin/start.md)"
```

- Let it check prerequisites and install the scaffolder
- When prompted for what to build, paste the slide 4 prompt **verbatim**:

```
Our Caldova store inventory is in Fabric, workspace at https://app.fabric.microsoft.com/[…]

Build an app for regional managers: show which products are running low across their stores (under a week of stock left) and let them send a reorder request to our purchasing system, recorded in Fabric.
```

- Let it select the template and scaffold the project
- Show the generated project structure once — do not read it out

Audience should see: a real project tree appear, not a single file.

- **Cut here.** Say the full round takes ~30 minutes and move to the prepared app.
- Stop the run — do not leave it churning in the background

---

## Code walkthrough + live reorder (slide 10, ~4m)

**The three files (~2m)**

- Switch to **Window 3**, tab 1 — the data model
- Show the `@entity()` class and the field decorators
- Switch to tab 2 — where "running low" comes from
- Show that the app **reads** the definition from the semantic model, and does not define it
- Switch to tab 3 — the reorder function
- Show **both halves** of the write path in this order:
  - the outbound call to the purchasing system
  - the record written back into Fabric with who, when, store, product, units
- Do not scroll further; three files, nothing else

Audience should see: the shared definition being read, and one call leaving.

**The live reorder (~2m)**

- Switch to **Window 2**
- Confirm the region shown is Kate's
- Pick a product with the fewest days of stock
- Send the reorder
- Point at the new row in **recent reorders**
- Point at the **dashboard number changing**

Audience should see: the row appear, then the dashboard move. That is the payoff — pause on it.

- **Do not** switch to purchasing; it is mocked and not on screen
- **Do not** open the Fabric portal; the dashboard moving is the proof
- Switch back to the deck

---

## Reset

Do this between runs, and before leaving the room.

- Delete the reorder rows created during the demo <!-- TODO: exact command or query -->
- Confirm the dashboard number is back to its starting value
- Confirm at least 3 products are still under a week of stock; reseed if not
- Delete the scaffolded project folder from the slide 8 run
- Clear terminal scrollback and history: `clear`
- Reload the app in Window 2 and leave it on the low-stock list, warm
- Re-open the three editor tabs in order
