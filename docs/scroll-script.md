# Scroll script — "An ERP, module by module"

Working script, 2026-11-11. Every figure was counted in the code of each system, not taken
from READMEs. Anything that exists only in docs is listed under **Do not claim**.
The site shows no repository or code links.

---

## The idea in one line

An ERP is eighteen modules that must agree with each other. The page opens on an empty ERP
schematic. Each chapter takes one real system apart — what it solves, **how** it works, **why**
it was built that way — and lights the modules it proves. At the end the whole map is live.

The reader never sees "hire me for your ERP". They watch the map fill in.

## The map (fixed rail on wide screens, bottom sheet on mobile)

| Band | Modules |
|---|---|
| **R · Relationships** | CRM & pipeline · Customer / resident portal · Communication |
| **O · Operations** | Procurement · Inventory & warehouses · Orders & fulfilment · Field operations · Maintenance & tickets |
| **F · Finance** | Contracts & payment schedules · Receivables / payables · General ledger · Tax & compliance · Payroll |
| **C · Platform core** | Identity & roles · Multi-organization · Audit trail · Documents & numbering · Jobs & scheduling |

Clicking a module jumps to the beat that proved it. Counter in the header: `07/18`.

## Rules for every beat

- **Depth, not a fact list.** Each beat = the problem → the mechanism (with real identifiers:
  state names, number formats, rates, account numbers) → why this design → an animation that
  *shows* the mechanism (a row refused by a policy, a number reserved, a journal posting, a sync
  reconnecting, a queue retrying). No decorative motion.
- Never headline with retail words (sale, shop, store, cart, fashion, car wash). The domain is
  named once per chapter as context.
- No client names, no gas imagery, no repository links. Figures are rounded down, never inflated.
- Visual language: technical drawing on steel paper — hairlines, corner ticks, numbered callouts,
  monospace readouts; one signal orange for "live / lit / in motion". FR · AR (RTL) · EN.

---

## 00 · Opening (pinned, 4 beats)

1. **Thesis.** "I build the systems an organization runs on." Spec card: 05 systems · 18 modules ·
   Web · Desktop · Mobile · FR · AR · EN.
2. **The map draws itself** — 18 empty modules, wires routed in the gutters, the core as a bus.
   *"An ERP is not one feature. It is eighteen modules that have to agree — every second, at every
   site, in every language, even when the network drops."*
3. **Core first.** Identities, permissions, numbering and audit underneath; business modules on top.
4. **How to read.** The map shrinks into the rail; legend: outlined = not proven yet, orange = proven.

---

## 01 · Sayroura Immo — *the platform*

*Context:* a multi-organization platform that runs property developers end to end — from the
first lead to years of residence management after handover.
Lights: **Multi-organization · Identity & roles · Documents & numbering · Jobs · Contracts ·
CRM · Maintenance.**

- **Many organizations, one database, zero leaks.** Problem: one forgotten `WHERE org_id = …`
  leaks a client's data. Mechanism: PostgreSQL row-level security, `ENABLE` + `FORCE`, a
  `tenant_isolation` policy reading `app.current_org`, set per transaction by `withTenant()`; the
  app connects as a DML-only role that cannot bypass the policy; a test proves cross-org reads
  return nothing. Why: the database refuses, instead of every developer remembering.
- **Who can do what.** Better Auth with organizations, 2FA and admin; roles owner,
  sales_manager, sales_agent, accountant, cashier, property_manager, technical_manager, resident,
  plus custom roles. Same screen, different actions per role.
- **Every object has a lifecycle.** Unit: available → optioned → reserved → sold → delivered
  (rented / blocked). Lead: new → contacted → visit_scheduled → visited → negotiation → won/lost.
  Shown stepping on scroll over the 3D maquette coloured by state.
- **Contract → schedule → receipt.** `buildSchedule` builds the payment plan, `checkVspLimits`
  enforces the legal limits of off-plan sales, payment calls fire on construction milestones,
  online payment through SATIM. Each receipt reserves a gap-free number inside the transaction
  (REC, RES, VSP, ADF, DEV, PVL) and renders one of 23 PDF templates.
- **After the keys.** Handover with snag lists, residence management (charge calls, budgets,
  assemblies), maintenance tickets, a 19-page resident portal, e-signature by emailed code.
  pg-boss runs 15 queues and 4 schedules, retrying what fails.
- Walkthrough of one buyer, screens with numbered pins, decisions, proof strip:
  134 tables · 135 migrations · 344 validated server actions · ~570 unit + ~93 end-to-end tests.

## 02 · SayrouraPOS — *the ledger*

*Context:* a desktop commercial-management and accounting system built around the Algerian
accounting plan (SCF) and tax rules.
Lights: **General ledger · Tax · Receivables / payables · Payroll · Inventory · Procurement.**

- **One document, balanced journals.** Every document posts double entry: 411 / 401 / 70 / 60 /
  4457 / 44566 / 53 / 512. Debit = credit is checked, journals export to CSV for the accountant.
- **Numbers with no gaps.** `nextDocNumber` → `PREFIX-YYYY-000001` per type and year (TK, AV, PO,
  RETF, RET, TRF, BT, CNT, Z). Why: a gap is the first thing a tax audit asks about.
- **Compliance as code.** TVA 19 / 9 / 0, IFU, stamp duty; compliant invoices with NIF/NIS/RC and
  the amount in words in FR and AR; credit notes; G50, état 104 and Jibaya'tic files prepared from
  the same data — never re-typed.
- **Payroll.** Gross → CNAS 9 % employee / 25.5 % employer, CACOBATPH 12.21 %, IRG → net, posted.
- **Stock that moves.** Multiple depots, two-phase transfers, counts with variance, CMUP
  valuation recomputed on receipt, supplier payables and post-dated cheques, aging
  current / 30 / 60 / 90 / 90+.
- **Works without the network.** Desktop is the system of record; LAN server with live events,
  cloud relay and PostgreSQL mirror re-sync on reconnect.
- Proof: ~64 tables · ~49 migrations · 4 roles · before/after audit log · ~460 tests · CI with secret scanning.

## 03 · SayrouraWash — *the field*

*Context:* a system that runs service crews on site — work orders on the phone, live supervision
on the web, pay calculated per job.
Lights: **Field operations · Audit trail** (re-lights Payroll).

- **Born offline.** A work order is created on the phone with no signal (plate read on the
  device), stored locally, synced on reconnect; local ids are mapped to server ids.
- **Live board.** Supervisors see IN_PROGRESS → DONE / CANCELLED in real time over websockets;
  a duplicate guard refuses a second open order for the same vehicle.
- **Pay is part of the system.** Commission in basis points, snapshotted on the job when it is
  created — a later rate change never rewrites history; payouts sum the snapshots.
- **Trust.** Every change writes a JSON before/after diff; refresh tokens rotate and a reused
  token revokes the whole family.
- Proof: 25 models · 76 endpoints · ~1,250 tests · tenant-isolation test.

## 04 · Dapper — *the back office & the portal*

*Context:* the back office, counter app and public portal of a multi-channel business — one
order flow, one stock, three languages.
Lights: **Orders & fulfilment · Portal.**

- **An order is a timeline.** pending → confirmed → preparing → packed → shipped →
  out_for_delivery → delivered (+ cancelled / returned / refunded), each transition stored as an
  event with who and when; carrier API hand-off.
- **Never trust the client.** Totals are recomputed server-side; a tampered order is refused.
- **Refused by default.** 21 permissions, a policy table that denies anything not granted.
- **Three apps, one core.** Portal, back office and counter as three installable apps on one data
  model, with an offline order fallback.
- **Stock you can reason about.** Barcode scan → movement log → days of cover and stock value.

## 05 · The messaging layer — *the wire*

*Context:* an embeddable real-time messaging layer (widget + SDK) that any internal application
can drop in. Honest framing: a focused prototype.
Lights: **Communication.**

- **Fan-out.** A message received by one server reaches clients connected to another through
  Redis; workspaces are scoped by `ws_<uuid>` keys. Threads, edits, reactions, typing.
- **Events leave safely.** Webhooks signed with HMAC, queued and retried; rate limits at 20
  requests/second and 100/minute.

---

## 06 · The map, complete

All 18 modules lit, wires flowing. Matrix of concerns × systems (isolation, roles, audit, legal
numbering, offline, live updates, background jobs, FR/AR, tests). Totals:
2,300+ automated tests · 250+ tables · 3 platforms · 3 languages.

## 07 · How I work

Map the flows → ship one module → prove it (tests, CI, audit from day one) → connect the next.

## 08 · Contact

Email, phone, location, languages, availability.

---

## Do not claim

- **POS:** an AI copilot · lot / expiry / serial tracking · filing taxes automatically (it
  prepares the files). Never show the shipped master data (real supplier names).
- **Immo:** a generated VSP contract PDF · a Content-Security-Policy · per-organization themes.
- **Wash:** shifts, attendance, scheduling, invoicing, multi-branch, CI.
- **Dapper:** stock across multiple locations · automated tests · speed figures.
- **Messaging layer:** end-to-end encryption · presence, read receipts, attachments, search ·
  production readiness.
