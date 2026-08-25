# Caldova reorder app — demo spec

Spec for generating the demo app with GitHub Copilot + Rayfin, from Caldova's existing Fabric data.

**Section 1 is the prompt shown on slide 4, verbatim.** Everything after it is supporting detail to make the app read well on a projector. Keep section 1 byte-identical to the slide — if the slide changes, change it here too.

---

## 1. The prompt

```
Our Caldova store inventory is in Fabric, workspace at https://app.fabric.microsoft.com/[…]

Build an app for regional managers: show which products are running low across their stores (under a week of stock left) and let them send a reorder request to our purchasing system, recorded in Fabric.
```

---

## 2. Data

The data already exists in Fabric. **Do not create or seed it, and do not copy it into the app's own store.**

- `stores` — store id, name, region
- `products` — product id, name
- `inventory` — stock on hand and recent sales per store and product

**"Running low" is defined in the Fabric semantic model, not in this app.** Read it. Do not reimplement the rule in application code, do not hardcode a 7-day threshold, and do not compute days-of-stock client-side. The whole point is that this app, the regional dashboard and analytics all read one definition, so their numbers cannot disagree.

If the definition changes in the semantic model, this app must change with it without a code edit.

---

## 3. Who uses it

A regional manager — Kate — responsible for the stores in one region.

- Authentication is **Fabric SSO** on the deployed app
- A manager sees **only the stores in their own region**; scope by the signed-in identity, never by a client-side filter
- No role switcher, no admin view, no impersonation

---

## 4. Screens

**One screen.** A dense multi-page app is wrong for this; everything below should be visible without navigating.

**Header — three summary tiles**

- Stores in region
- Products running low
- Reorders sent today

Large numbers, short labels. These are read from across a room, not studied.

**Main — products running low**

- Sorted worst-first: fewest days of stock at the top
- Per row: product name, store, **days of stock left**, units on hand
- Days-of-stock is the hero value on each row — largest text after the product name
- Urgency shown by more than colour alone: weight, a bar, or a badge, so it survives a washed-out projector and colour-blind viewers
- Aim for 6–8 rows visible without scrolling

**Reorder action**

- One clear action per row
- Quantity, with a sensible suggested default already filled in
- Confirm in a single step — no multi-step wizard, no modal stack
- On success: immediate feedback on the row, and the row's urgency updates

**Recent reorders**

- A short list of the most recent requests: product, store, units, who, when
- A newly sent reorder **must visibly appear here within a second or two**

This is the demo's payoff moment. If the new row is subtle, the demo has no punchline. Make its arrival unmistakable from the back of a large room — but do not animate for longer than about a second.

---

## 5. The write path

The reorder goes through a **function**, not a direct client write.

The function does two things, in this order:

1. **Calls the purchasing system.** For this demo the endpoint is **mocked** — but wire the call properly, with a real client, real request shape and real error handling. This code is shown on stage to a developer audience; it must read as production code, not a stub with a `// TODO` in it.
2. **Records the request in Fabric** with: product, store, units, **who requested it**, and **when**.

Those last two columns are the point. The talk claims every action is traceable; this record is that claim.

Keep the function short and readable — it is displayed on a projector. Both halves should fit on one screen at 18pt without scrolling. Clear names over clever abstractions; no helper indirection that hides either half.

---

## 6. Look and feel

Professional and restrained. It should look like an internal tool a real company would deploy, not a template demo or a consumer app.

- Calm, neutral base with a single accent colour
- Clean sans-serif; generous line height
- Real product and store names throughout — never `Lorem ipsum`, never `Product 1`
- Plausible numbers: stock counts that look like a pharmacy chain's, not `9999`
- Empty, loading and error states that look designed, not default

**Projector constraints — these override normal web conventions:**

- Base font noticeably larger than a typical web app; nothing below ~16px equivalent
- High contrast throughout; light background — dark themes wash out under projection
- Generous spacing; whitespace is more valuable than density here
- No small secondary text, no tooltips, no truncated cells, no horizontal scrolling
- Nothing essential in the bottom ~15% of the viewport; in many rooms the audience cannot see it

An app that looks impressively dense on a laptop reads as noise from row ten.

---

## 7. Out of scope

Do not build:

- Sign-up, sign-in or password screens — Fabric SSO handles it
- Admin, settings or user management
- Cross-region or company-wide views
- Reorder history beyond the recent list, approval workflows, or order tracking
- Mobile or responsive layouts below tablet width
- Internationalisation, theming, or a dark mode
- Tests, CI, or docs beyond a short README

Anything not on screen during a 15-minute talk is not needed.
