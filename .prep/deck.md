# Turn your data into production apps with Rayfin

A 15-minute lightning talk on why prototypes stall before production, and how a code-first backend on Microsoft Fabric removes the rewrite step. For developers and technical decision makers, level 200. Speaker: Yohan Lasorsa, Principal Cloud Advocate, Microsoft.

---

<!-- Slide 1 -->
## Turn your data into production apps with Rayfin

- Yohan Lasorsa | Principal Cloud Advocate, Microsoft

*Visual: Template title slide.*

<!--
Hi, I'm Yohan. We have 15 minutes, one app, and one question: why is it still so hard to get something you built into the hands of real users?

I'm not going to answer that with a diagram. Two screens, same company, same job, and I want you to guess what it took to get from one to the other.
-->

---

<!-- Slide 2 -->
## How Caldova stock reorders used to be

*Visual: Full-bleed — a store inventory spreadsheet next to an email thread with several replies and a "FINAL_v3" attachment. No bullets on this slide; the image carries it.*

<!--
Caldova is a pharmaceutical company. Kate manages 15 of their retail stores, and this is her Monday.

Every store extracts their inventory into a spreadsheet, they email it to her. She merges the files by hand, decides what to reorder, and emails it to the central purchasing office. It takes most of a day, and by the time she's finished, the numbers she started from are already stale.
-->

---

<!-- Slide 3 -->
## Demo / video: dashboard view of the app

*Visual: Switch to the live app for 20–30 seconds — products running low across all stores, one reorder, dashboard reacts. Have it loaded and warm in a second window; recorded video as the fallback path.*

<!--
[Switch to the live app] Same job. Every store, one view, live. She sees what's running low across the region, sends a reorder, and the regional dashboard updates from the same data. There's no export, no reconciliation, no Monday.

This is a real app. It has sign-in, it has permissions, its data sits in the company's governed data estate, and the analytics team can query it without asking anyone for a copy.

So the honest question is not "can you build this?" Yes! You can. You could probably vibe-code the screen you're looking at before lunch.

The question is why the prototype you build usually never reaches production. Let's rewind and find out, because this app, connected to the live company data, started from one prompt.

For the time remaining, I want to show you why that is much harder than it sounds, and what actually makes it possible.
-->

---

<!-- Slide 4 -->
## It starts with the data you already have

`copilot -i "$(curl -sSfL https://aka.ms/rayfin/start.md)"`

> Our Caldova store inventory is in Fabric, workspace at https://app.fabric.microsoft.com/[…]
>
> Build an app for regional managers: show which products are running low across their stores (under a week of stock left) and let them send a reorder request to our purchasing system, recorded in Fabric.

*Visual: The command on one line, monospaced and dominant, with the prompt below it in a Copilot CLI panel. Nothing else on the slide. Both must be readable from the back of the room.*

<!--
That’s how it started. One command, one prompt.

Here I used Copilot CLI, because I'm a developer and I live in a terminal, but this isn't a CLI trick. VSCode or the GitHub Copilot app gets you to the same place.

One important part is the first line of the prompt. Caldova's stock data was already in databases: we imported them into a Fabric lakehouse first. We pointed at the data the company already had, and built the app from this data. 
-->

---

<!-- Slide 5 -->
## The demo works, now the questions start.

*Visual: images/iceberg-trust.png — flat-vector iceberg in the deck palette, waterline high. Above the water, small, labelled "Prototype": the tip. Below, on the submerged mass: the caption "Everything the prompt didn't ask for" over a teal rule and five labels — Identity · Access & permissions · Data governance · Audit trail · Cost. Title on a white band above the image.*

<!--
Vibe-coding is all fun, you quickly get a prototype that seems to do the work. But then the real questions start:

Who can use this app? And not just "is there a login box?",  the company needs to know who signed in, and revoke their access on their last day.
Who's allowed to see which stores? Kate sees her region, not the one next door.
Who owns the data? Is it a copy, and how old is it? Who keeps it current? Who secures it, backs it up, and is accountable when it's wrong? That's the widest surface for things to go wrong, and the least visible.
Would you trust the reorder number? If nobody can tell you where it came from, who changed it, or when, then it can’t be used.

That's the iceberg. The app is the small part you can see. Everything below the line is what the app needs to be deployed in a company production environment. That’s where the complexity is, and that’s usually what triggers a costly rewrite of the prototype, or gets it dropped entirely.
-->

---

<!-- Slide 6 -->
## Enterprise apps need more than vibes

**Software developers need to:**
- Stand up databases
- Wire up authentication
- Configure backend services
- Safely connect to existing customer data
- Follow compliance and governance rules

**IT admins need to:**
- Keep one view of company data
- Give the right people the right data access
- Maintain security and compliance
- Keep cloud costs in check
- Prove it all to auditors

*Visual: Two-column layout with the existing icons — developers left, IT admins right. Keep the columns visually equal; neither side is the villain.*

<!--
And here's why that rewrite keeps happening. It isn't one team being slow.

Look at what the developer actually has to do to make Kate's app real: databases, authentication, backend services, a safe connection to live company data, and every governance rule that comes with it. And it also has to match the company IT requirements: one view of company data, the right access for the right people, security, cost, and the ability to keep every trace for when an audit is needed.

There's a fundamental tension here:
- Developers want speed, simplicity, and to stay in their flow.
- Enterprises need governance, security, compliance and cost control.

Most platforms make you pick a side, and optimise for the left-hand part, which is exactly why the app dies when it meets the right-hand one.
-->

---

<!-- Slide 7 -->
## Get the best of both worlds

**Rayfin** — enterprise-ready app backend in Fabric (public preview)

- Speed developers want: agent-powered coding, idea to app
- Standards enterprises require: security, governance, scale
- Built in from the start, not bolted on
- Data lands in Fabric on the first write

*Visual: The two columns from the previous slide collapsing into one Rayfin block. Reuse the existing product graphic.*

<!--
Rayfin removes that tradeoff. Developers and coding agents define a complete backend in code, and it deploys straight into Fabric as a governed, production-ready application.

The part to hold onto is the last line. The data lands in Fabric on the first write, the same place the rest of the company's data already lives. So the moment Kate's app writes its first row, that row is governed, permissioned, and queryable by the analytics team. Not after a migration. On the first write.

That's the whole trick: there's no prototype anymore. Rayfin allows you to vibe-code the production app directly, there's no rewrite. No infrastructure to manage, no re-platforming step. There is no second version.

Now let me show you, starting from that prompt.
-->

---

<!-- Slide 8 -->
## Demo — from prompt to running app

- Start from the data-app template
- One prompt, real scaffold
- Running locally in seconds

*Visual: Live. Fallback: three screenshots — the prompt, the generated project structure, the app booting.*

<!--
We'll do it exactly as I told you.

This command starts Copilot CLI from this start.md that lets you get started with Rayfin, without even having to go through the docs. It will check the prerequisites on your system, install the rayfin scaffolder package if needed, and ask you what you want to build.

Let's use the prompt from earlier, starting from the data in Microsoft Fabric.

What it does is now is select the right template from the available ones, and create the project from it. Then it will look at our data, and use the Rayfin SDK to generate the backend and frontend code for the app.

The complete round takes about 30 minutes, so I'll skip to one example of what it produced.
-->

---

<!-- Slide 9 -->
## Vibe-coding with guardrails

Everything below the waterline, built in.

**Agent-native**
- SKILL.md, MCP server, GitHub Copilot starter, CLI commands

**Templates**
- Start from enterprise-ready templates

**Primitives**
- Auth, Database, GraphQL APIs, Functions

**Lifecycle**
- Automatic schema migrations, one-command deployment

*Visual: Four equal columns on the light master, each with a theme-accent icon and a vertical rule between them. The iceberg tip rises out of a sand band along the bottom edge, tying back to slide 5.*

<!--
What you saw surely looks like your regular vibe-coding session. So what made that one different?
Look at what came out of it. Delegated identity, so the app knows who signed in, from the company directory and not a users table someone invented. APIs and functions generated against the real schema. Migrations and a one-command deploy, so the path to production isn't a ticket.

Remember the iceberg from earlier? Every one of those was below the waterline a few minutes ago.

What made it different was the starter templates, primitives provided through the Rayfin SDK and the agent-native guidelines and CLI provided.It's still vibe-coding, you still move at prompt speed, you just can't accidentally build something the company can't run.
-->

---

<!-- Slide 10 -->
## Demo — one definition, one way out

One definition. Everyone reads the same number.

*Visual: Single-frame diagram. A large rounded container labelled **Microsoft Fabric** fills the slide — the boundary is the argument. Inside, left: a stack of tables, "stores · products · inventory". Inside, centre: a highlighted **Semantic model** box holding one line of plain English — "running low = less than 7 days of stock". Inside, right: three consumers with identical arrows off that box — Kate's app, Regional dashboard, Analytics. Below: Kate's app → **Function** → one arrow crossing the container boundary out to a grey **Purchasing system**, and a second arrow curving back inside to the tables, labelled "reorder recorded". Exactly one arrow ever leaves the container. Theme colours: container #2A446F, semantic model highlighted #0078D4, function #49C5B1, purchasing system #8C8279 outside the boundary.*

<!--
Two things make this app what it is, and both are small.

First, where the numbers come from. Caldova's stock data is in Fabric, and on top of it sits a semantic model — the shared definition of what the company's numbers actually mean. "Running low" is defined once, right there: less than a week of stock. Kate's app doesn't define it. The regional dashboard doesn't define it. They both read it. That's why the number in the app and the number in the boardroom can't disagree — there's only one of them.

Second, the write. Kate sends a reorder and it goes through a function. That function calls the purchasing system — that's the email from Kate's Monday, gone — and records the request back in Fabric: who, when, which store.

And notice what the diagram is really telling you. Exactly one arrow leaves that box. Everything else stayed inside the governed estate, because it was never outside it to begin with.

[Switch to the live app] So let's do it for real. Kate's region, a product running low, send the reorder — there it is in purchasing, and the dashboard just moved.

That's the app from the first two minutes. Now you know what's underneath it.
-->

---

<!-- Slide 11 -->
## From idea to production

**Describe it**
- One command, one prompt, pointed at data Caldova already had

**Ship it**
- Identity, APIs and deployment came attached with the scaffold

**Trust it**
- Kate's reorder reached purchasing, and left a record in Fabric

*Visual: Three columns, equal weight — numbered accent circles, vertical rules, and a takeaway band across the bottom carrying the "write it twice" line.*

<!--
Three things to take away.

Describe it. We said what the app should do in plain language, pointed at data the company already had. Copilot planned against a real Fabric estate, and turned our data into an app.

Ship it. What came back had identity, APIs and a deploy path already attached. The parts that normally arrive months later as a rewrite were in the first commit.

Trust it. Kate's reorder reached the purchasing system and left an auditable record in Fabric, so anyone can trace where that number came from.

And if you take one sentence away: the fastest path to production isn't writing your app faster. It's not having to write it twice.
-->

---

<!-- Slide 12 -->
## Resources and next steps

- Learn more: aka.ms/rayfin
- Get started in one command:
- `copilot -i "$(curl -sSfL https://aka.ms/rayfin/start.md)"`
- Documentation: aka.ms/rayfin/docs
- Blog: aka.ms/rayfin-blog

*Visual: Imported from pptx slide 16. Keep the command visually dominant — it is the call to action, and the third time they've seen it.*

<!--
It's all on this slide, but there's really only one line that matters, and you've seen it twice already.

That command is the whole on-ramp. It checks your machine, installs what it needs, and asks you what you want to build. Point it at data you already have, and see how far it gets.

Docs and the blog are there when you want the detail.

I'll be around after this if you want to argue with me about any of it — especially if you think your rewrite was unavoidable.
-->

---

<!-- Slide 13 -->
## Please rate this session

- Your feedback shapes next year's tour
- Takes under a minute

*Visual: Session evaluation QR code, full width. Leave this slide up during questions.*

<!--
Last thing, and I do mean it: please fill in the evaluation. It's about a minute, and it genuinely decides what gets built into next year's tour — including whether talks like this get more time than fifteen minutes.

Thank you.
-->
