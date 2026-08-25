# LTG291 — Official prep slide (as of 7/15/2026)

**Session:** FY27 AI Tour | Core Lightning Talk | LTG291
**Conversation theme:** Build a unified, governed data and AI estate
**Level:** 200 · **Length:** 15 min (13 min flow + 2 min Act Three)
**Customer Speaker(s):** none · **Local Customer Story:** No
**Speaker Cast:** Main Speaker (TBD)
**Session Team:** Owners — Anthony Bartolo, Kavita Makdani · Authors — Paul DeCarlo

**Title (≤50 C):** Turn your data into production apps with Rayfin

**Abstract (≤250 C):**
> Ship faster and decide with confidence. With Rayfin, every app you build with GitHub Copilot lands its data governed and analytics-ready in Microsoft Fabric, so you go from idea to a ready production app your whole org can trust, with no rewrite.

**Objectives (attendees will):**
1. Move from intent to action and increase decision confidence
2. See how a code-first backend on Microsoft Fabric closes the prototype-to-production gap with agentic engineering
3. Understand how apps built with GitHub Copilot produce governed, analytics-ready data from day one

## Session flow

**Act One — Fix the production gap** (~6 min)
| Type | Block | ⏱ |
|------|-------|----|
| SPEAKER | Introduction — TBD | 1 min |
| GRAPHICS | Why most prototypes die at production: auth, data, governance force a rewrite | 2 min |
| GRAPHICS | What Rayfin is: a code-first backend on Microsoft Fabric (schemas, APIs, storage, hosting) | 2 min |
| GRAPHICS | Vibe-coding on rails: the data-app template + agentic tools | 1 min |

**Act Two — Turn your data into a real app** (~7 min)
| Type | Block | ⏱ |
|------|-------|----|
| DEMO | Start from the data-app template: scaffold a real app in seconds | 2 min |
| DEMO | Semantic model to app: turn a Fabric semantic model into a working app, data coming straight from Fabric | 3 min |
| DEMO | Integration with systems through functions, and write new governed data back into Fabric | 2 min |

**Act Three — Key takeaways** (2 min)
- Recap [GRAPHICS]
- Next Steps: Additional Sessions, Learning, Resource
- Evaluation Slide — ask attendees to complete one

---

## Demo use case — LOCKED

**Company:** Caldova — fictional pharma; we demo its **pharmacy / drugstore retail arm** (OTC / consumer-health). Retail-easy, no patient data, no regulated clinical decisions.
**Persona:** store / regional manager of Caldova pharmacies.
**Read (Fabric semantic model):** OTC SKUs low-stock / underperforming per store (days-of-stock, sell-through) — governed single source of truth across all stores.
**Action + write-back (function):** manager triggers a **restock request** → written back to Fabric, governed + audited + analytics-ready; regional dashboard updates instantly.
**Prototype→prod gap (Act One punch):** every pharmacy runs its own restock Excel/shadow app → numbers drift, no enterprise-wide view to query → someone builds a quick app → auth-per-store, who-sees-what, storage/governance → rewrite. Rayfin closes it: one governed app on the shared estate from day one.

---

## Draft for the content outline

## rayfin lightning talk 15min

Turn your data into production apps with GitHub Copilot and Rayfin

Most prototypes never reach production. The moment real users arrive, auth, data, and governance force a rewrite. Rayfin removes that step. You describe your backend in code with GitHub Copilot, and every app you ship stores its data in Microsoft Fabric, governed and ready for analytics from day one. No separate data pipeline, no rebuild. See an app go from a rough idea to a real service your whole organization can trust and query.

---
Turn your data into apps with GitHub Copilot and Rayfin

Ship faster and decide with confidence. With Rayfin, every app you build with GitHub Copilot lands its data governed and analytics-ready in Microsoft Fabric, so you go from idea to a production app your whole org can trust, with no rewrite.
