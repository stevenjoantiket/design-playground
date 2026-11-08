---
name: tiket-prd-to-figma
description: Turn an uploaded PRD into a Figma design built from tiket.com's Design Passport components, checked against WCAG, Nielsen heuristics and Laws of UX, for mobile, desktop or dashboard.
---

# tiket.com PRD → Figma Design (Design Passport)

Use this skill when a user shares a PRD (PDF, DOCX, MD, Confluence/Notion link, or pasted text) and wants screens designed in Figma for tiket.com. Output is real Figma frames built from **Design Passport** (tiket's design system) library components and variables, never hand-drawn look-alikes.

**Deliverables (every run):**
1. **User flow diagram:** screens, decision points and edge-case branches.
2. **Hi-fi screens:** final visuals built from Design Passport components, including every state.
3. **Prototype links:** clickable connections between frames along the happy path and the main alternate paths.
4. **Copy deck:** a frame listing all key UX copy in ID + EN, with a primary version and 2 alternatives (see Phase 5b).

**Checkpoint:** there is exactly one confirmation step. Do Phases 1–4, show the Design Brief, and wait for the user's OK. After that, build the flow, all screens and the prototype in one go without stopping for feedback. Review happens at the end (Phase 7). Skip the checkpoint only if the user says so.

**Copy language:** screens on the canvas use **English** copy by default (use ID on canvas only if the user or PRD asks). All copy is still written **bilingually (ID + EN)** in the copy deck, and the longest ID strings are checked against the layout (ID is ~20–30% longer). Follow the UX writing rules in Phase 5b.

---

## Phase 0 — Check tools

1. Confirm a Figma connector (Figma MCP) is available. You need tools that can: read a library/file (e.g. `get_metadata`, `get_design_context`, `get_variable_defs`, `get_screenshot`), search the design system (e.g. `search_design_system`), and write to the canvas (e.g. `use_figma` / create frames and instances). Use whatever names the connected server exposes.
2. If no Figma connector exists, search the connector registry for "figma" and suggest it. If the user can't connect it, fall back to producing a detailed spec (Phase 7 format) they can hand to a designer.
3. Ask for, or find, the target Figma file URL where frames should be created. Never write into the Design Passport library file itself.

---

## Phase 1 — Read the PRD

Read the whole PRD. Extract into a working summary:

| Field | What to capture |
|---|---|
| Product / vertical | Flight, Hotel, Train, Car Rental, To Do (attractions), Bus & Shuttle, Payment, Account, Loyalty (tiket Elite / tiket Points), Internal tool, etc. |
| Problem & goal | The user problem and the business metric (conversion, CTR, drop-off, CS tickets…) |
| Target users | B2C traveler, B2B partner/merchant, internal ops/CS, etc. |
| User stories / JTBD | List each one; every story must map to at least one screen or state |
| Scope | In scope / out of scope / phase |
| Flows | Entry points, happy path, alternates, exits |
| Functional requirements | Numbered; keep the PRD's IDs if present |
| Data & content | Fields, sample data, copy, localization (ID/EN) |
| Edge cases | Empty, loading, error, offline, sold out, price change, timeout, partial data |
| Constraints | Platforms, tech limits, legal/compliance, deadlines |
| Success metrics | So the design can make them measurable/visible |
| Open questions | Anything ambiguous — list, don't guess silently |

If the PRD is missing something critical (platform, primary flow, key data), ask the user with a short multiple-choice question before continuing.

---

## Phase 2 — Detect the platform

Decide the build target from the PRD. Look for explicit words first, then infer.

| Signal in PRD | Target | Default frame | Grid / notes |
|---|---|---|---|
| "app", "iOS", "Android", "native", push notification, bottom sheet, deeplink | **Mobile app** | 360×800 (Android) and/or 375×812 (iOS) | 4-col, 16px margin, 8px spacing base; bottom nav; safe areas; thumb zone |
| "mWeb", "mobile web", responsive | **Mobile web** | 360×800 | Same as mobile, plus browser chrome allowance; no native-only patterns |
| "web", "desktop", "tiket.com site", SEO page | **Desktop web** | 1440×1024 (content max ~1200) | 12-col, 24px gutter; hover states; keyboard focus |
| "dashboard", "back office", "admin", "CMS", "partner portal", "TIX", ops/CS/merchant users, tables, filters, bulk actions | **Dashboard** | 1440×900 (also check 1280) | Side nav + top bar; dense tables; filters; pagination; data-first |

Rules:
- If more than one target applies, design the primary one first and list the others as follow-ups.
- If it's unclear, ask: "Mobile app, mobile web, desktop web, or dashboard?"
- Use the Design Passport components for that platform (mobile vs web vs dashboard variants often differ — pick the matching variant/property).

---

## Phase 3 — Gather research insights

Look for evidence before designing. Sources, in order:
1. Research sections inside the PRD (user interviews, usability tests, surveys, data/analytics, CS complaints, competitor benchmarks).
2. Other files the user uploaded or linked.
3. Connected tools if available (Confluence, Notion, Google Drive, Dovetail, Jira, Slack) — search for the feature name / vertical.
4. Ask the user once: "Is there any research or data for this feature?"

Summarize as an **Insight table**:

| # | Insight | Source | Confidence (High/Med/Low) | Design implication |
|---|---|---|---|---|

If there is no research, say so plainly in the brief and mark the related decisions as **assumptions to validate**. Never invent research findings or quotes.

---

## Phase 4 — Read Design Passport & write the Design Brief

### 4a. Read the design system
1. Search the tiket Figma org for the Design Passport library (search terms: "Design Passport", "DP", "tiket design system"). Pick the published library file, not a copy or a team's working file. Tell the user which library file you found (name and link) in the Design Brief so they can correct it. If nothing is found or several candidates look equally official, list them and ask. Reuse the confirmed library for the rest of the session.
2. Pull the **foundations** as variables/styles: color (brand blue, semantic success/warning/error/info, neutrals, surface), typography scale, spacing, radius, elevation/shadow, grid, iconography.
3. Search the library for each component the flow needs, e.g. Button, Text Field, Search Form, Date Picker, Passenger/Guest Selector, Chip/Filter, Card (product, price, promo), List Item, Tabs, Bottom Sheet, Modal/Dialog, Toast/Snackbar, Banner/Alert, Badge/Tag, Stepper, Navigation (top bar, bottom nav, side nav), Table, Pagination, Empty State, Skeleton, Price Breakdown, Rating.
4. Record for each: component name, key/ID, available variants & properties (size, state, type), and any usage notes/do-don'ts on the library page.
5. If a needed component does not exist, do **not** fake it. Compose it from existing primitives + variables, name it `[Proposal] <Name>`, and flag it in the handoff for the DS team.

### 4b. Design Brief (show to user before drawing)

```
Feature:            <name>        Vertical: <vertical>
Platform:           <mobile app / mWeb / desktop / dashboard>  Frame: <size>
Design Passport library: <file name + link found in the org search>
Writing guidelines found: <glossary / writing / brand docs found, or "none — default rules used">
Primary user & goal:
Key insights used:  <from Phase 3, or "none — assumptions listed">
Screens & states:   <numbered list, each mapped to user story / FR IDs>
Design Passport components: <list>
New/proposed components:    <list or none>
UX principles applied:      <top 5 from Phase 5 most relevant here>
Assumptions & open questions:
```

---

## Phase 5 — UX & accessibility rules to apply

Apply these while designing, then verify in Phase 7.

### WCAG 2.2 AA (minimum)
- Text contrast ≥ 4.5:1 (≥ 3:1 for text ≥ 24px, or ≥ 19px bold). Non-text UI (icons, borders of inputs, focus rings) ≥ 3:1. Check brand-blue-on-white and text on promo banners/images.
- Don't use color alone to convey meaning (errors, selected states, price drops, availability) — add icon, text, or pattern.
- Target size ≥ 24×24 CSS px (2.5.8); use **44×44 (iOS) / 48×48 dp (Android)** for mobile touch targets.
- Visible focus state on every interactive element (web & dashboard); logical focus/reading order.
- Form fields have persistent visible labels (not placeholder-only), clear error text next to the field, and error prevention/confirmation for payments and irreversible actions (3.3.4).
- Don't require dragging or complex gestures without a single-pointer alternative (2.5.7).
- Support 200% text zoom / dynamic type without clipping; design in English but leave room for Bahasa Indonesia strings being ~20–30% longer.
- Motion: provide reduced-motion alternatives; no flashing.
- Name every layer meaningfully and annotate alt text for meaningful images/icons.

### Nielsen Norman Group — 10 usability heuristics
1. Visibility of system status — loading, progress (booking steps), price/availability refresh, timers.
2. Match with the real world — traveler language, clear formats: `Rp1,250,000`, `Wed, 23 Sep 2026`, 24h time, city + airport code.
3. User control & freedom — back, edit search, undo, cancel before pay.
4. Consistency & standards — Design Passport patterns first; platform conventions (HIG / Material) second.
5. Error prevention — disable invalid dates, validate passenger names vs ID, confirm before paying.
6. Recognition over recall — keep search summary visible, recent searches, saved passengers.
7. Flexibility & efficiency — filters, sort, shortcuts; bulk actions in dashboards.
8. Aesthetic & minimalist design — one primary CTA per screen; progressive disclosure for details.
9. Help users recover from errors — plain-language message + cause + next action.
10. Help & documentation — contextual info (refund/reschedule policy, fee tooltips), link to Help Center.

### Laws of UX (use where relevant)
- **Fitts's law** — primary CTA large and in the thumb zone (mobile: sticky bottom).
- **Hick's law** — limit choices per step; smart defaults; group filters.
- **Jakob's law** — follow patterns users know from tiket and common OTAs.
- **Miller's law / chunking** — chunk info (flight card: time, route, duration, price).
- **Tesler's law** — the system absorbs complexity (auto-fill, pre-selected best option).
- **Doherty threshold** — feedback < 400ms; use skeletons for longer loads.
- **Von Restorff** — reserve visual emphasis for one thing (best price, promo) — not everything.
- **Serial position** — most important items first/last in lists and nav.
- **Goal-gradient** — show progress in multi-step booking/checkout.
- **Peak-end rule** — design a clear, reassuring confirmation/e-ticket moment.
- **Gestalt (proximity, similarity, common region)** — group related fields and price lines.

### tiket.com / travel commerce specifics
- Price transparency: show final price or clearly label "before tax/fees"; show breakdown before payment; strike-through only for real discounts.
- Trust: refund/reschedule badges, secure payment cues, clear cancellation policy.
- Urgency cues ("2 seats left") only when true and data-backed — no dark patterns (fake scarcity, pre-ticked add-ons, confirmshaming).
- Localization: design with EN copy by default; test the longest labels, buttons and tabs with ID copy to verify they fit.
- Dashboards: prioritize scannability — right-aligned numbers, sticky table headers, clear status tags, empty/filter-no-result states, bulk action confirmation.

---

## Phase 5b — ✍️ UX Writing

Write all screen copy as a Senior UX Writer for a digital travel product: ready-to-use copy that can be placed straight into the design.

### 🎯 Role & priority

Copy must always be:

- Clear
- Friendly
- Reliable
- User-first

Follow these sources in strict priority order, when available (from the user, uploaded files, or connected tools such as Confluence/Notion — search for them once at the start):

1. UX Writing Glossary
2. Product Writing Guidelines
3. Brand & Product Content Guidelines

Never mention these documents in the copy itself. If none are available, say so in the Design Brief and use the rules below.

### 🧠 Default writing rules (mandatory)

**Language**

- Write every string bilingually: Bahasa Indonesia (ID) and English (EN).
- EN goes on the canvas by default; both go in the copy deck.

**Point of view**

- 2nd person only. ID: *kamu*. EN: *you*.

**Tone & personality**

Pick the tone per string using this tone map:

| Impact level | Examples | Tone |
|---|---|---|
| Low | Onboarding, empty states, promos, success toasts | Encouraging, easy-going; light warmth is fine |
| Medium | Search, forms, filters, booking steps | Clear, helpful, neutral |
| High | Payment, errors, cancellation, refunds, data/security, time-limited actions | Calm, direct, reassuring; no jokes or emotional language |

Default personality: encouraging, easy-going, reliable.

Never sound:

- Salesy
- Robotic
- Overly playful in serious contexts

**Grammar & mechanics**

- Follow standard grammar and punctuation rules.
- Prefer active voice.
- Respect punctuation rules per component: no full stop on buttons, labels, tabs or short titles; full sentences in body text and messages.
- Buttons are verb-first and name the action ("Pay now", "Bayar Sekarang"), not "OK" or "Submit".
- Copy length must fit the component. Check truncation with the longer ID string.

**Product & term usage**

- Always use approved product names and glossary terms (e.g. tiket.com, tiket Points, tiket Elite, vertical names as the glossary spells them).
- If a term exists in the glossary, you must use it.
- If not, choose the clearest, most user-friendly wording.

### 🧩 Context check (per string)

Before writing each string, identify:

1. Component type (button, title, body, label, helper text, error, toast, empty state, dialog…)
2. User state / trigger
3. Primary user action, if any

In this skill, get these from the PRD, the flow diagram and the screen itself. Don't stop mid-build to ask about individual strings. If something is unclear, list it under "Assumptions & open questions" in the Design Brief (Phase 4b) so it's resolved at the single checkpoint.

### 🎚️ Tone confidence rule

- If a tone feels risky or awkward, default to clear and neutral.
- Avoid jokes or emotional language in high-impact states.

### 📦 Copy deck format (mandatory)

Add a **Copy deck** frame next to the screens. For every key string (page titles, primary CTAs, error/empty/success messages, dialog titles and body, key helper text), use this format:

```
[Frame ID] · [Component] · [State / trigger]

✅ Primary Version   (used on canvas)
ID: <best, safest option>
EN: <equivalent meaning and tone>

🔁 Alternative 1
ID: <variation>
EN: <equivalent>

🔁 Alternative 2
ID: <variation>
EN: <equivalent>
```

Minor strings (field labels, nav items, table headers) only need the primary ID/EN pair.

### 🔍 Final quality check (silent)

Before finalizing copy, check silently (don't describe this in output):

- POV is correct
- Glossary terms are correct
- Product names are correct
- Tone matches component and state
- Copy fits UI size

### ⚠️ Claim note

If wording risks overclaiming ("cheapest", "guaranteed", "instant refund", "best price"):

- Add a short note in the copy deck suggesting a safer option.
- Don't block the output.

### 🚫 Out of scope

Legal, T&C, crisis errors, B2B and Customer Care copy may be written normally, but flag them in the copy deck for review by the owning team.

### 🧠 Designer reminder

Add this line at the top of the copy deck: *"AI drafts faster. UX Writers still do final QA."*

---

## Phase 6 — Build in Figma

1. Create a page in the target file named `<Feature> — <Platform> — v1 (<date>)`.
2. Add a **cover/brief frame** with the Design Brief and Insight table.
3. **User flow diagram:** in a section at the top of the page, draw the flow before the screens. Use labeled boxes for screens (numbered to match the frame names), diamonds for decisions (e.g. "Seat available?", "Payment success?"), and arrows for transitions. Include entry points, the happy path, alternate paths, and edge-case/error branches from the PRD. Mark which boxes are covered by hi-fi screens.
4. For each screen: create a frame at the platform size with the platform grid, then place **Design Passport instances** (not detached) and bind colors/type/spacing to library variables. Never hard-code hex values or font sizes that exist as tokens.
5. Build every required state per screen: default, loading (skeleton), empty, error, success, and edge cases from the PRD (sold out, price changed, session timeout, no internet).
6. Place the ✅ primary EN copy from the copy deck on the canvas (Phase 5b), and build the **Copy deck** frame beside the screens. Use realistic Indonesian sample data (real city/airport names, plausible prices in IDR such as `Rp1,250,000` in EN locale, Indonesian names), not lorem ipsum.
7. Use auto layout everywhere so text expansion and responsive behavior work.
8. Lay screens left-to-right in flow order, matching the flow diagram, and label each frame `01 Search`, `02 Results`, `02a Results – Empty`, etc.
9. **Prototype links:**
   - Set the first screen as the flow starting point, named after the flow (e.g. "Flight booking – happy path"). Add extra starting points for major alternate flows.
   - Connect every primary CTA, back button, nav item and key tap target to its destination frame (On tap/click → Navigate to).
   - Use Open overlay for bottom sheets, modals and dropdowns; Back for back buttons; Smart animate or Instant (keep it simple, respect reduced motion).
   - Link error/empty states from the action that triggers them where practical.
   - Make sure no primary CTA on a happy-path screen is left unlinked.
10. Add annotations beside frames: linked user story / FR ID, interaction notes, accessibility notes (focus order, alt text, target size), and which UX principle drove a decision.
11. Take a screenshot of the result and look at it before claiming done.

---

## Phase 7 — Self-review & handoff

Run this checklist and put the results in a **Review frame** and in the chat reply:

- [ ] Every user story / FR maps to a screen or state (traceability table).
- [ ] Platform correct; frame sizes & grid correct.
- [ ] Only Design Passport components/variables used; proposals clearly marked `[Proposal]`.
- [ ] Contrast checked on all text and key UI (list any fails).
- [ ] Touch/click targets meet size rules.
- [ ] Color never the only signal; labels visible on all fields.
- [ ] Loading, empty, error, and edge states present.
- [ ] One primary CTA per screen; progress shown in multi-step flows.
- [ ] User flow diagram covers happy path, alternates and edge cases, and matches the frames.
- [ ] Prototype runs from the starting point to the end of the happy path; no unlinked primary CTAs.
- [ ] Canvas copy is EN; longest ID strings checked for fit; price/date/time formats consistent.
- [ ] Copy deck complete: ID + EN, primary + 2 alternatives for key strings, 2nd-person POV (*kamu* / *you*), glossary terms and product names correct, tone matches impact level, claim notes added where needed.
- [ ] No dark patterns.
- [ ] Research insights reflected; assumptions listed for validation.

Final reply to the user (short): link to the Figma page, the prototype link (starting point), the list of screens, proposed new components, failed/at-risk checks, and open questions for the PM. Don't restate the whole brief.

If Figma writing was not possible, deliver the same content as a written spec: per screen — purpose, layout (top→bottom), Design Passport components with variant/props, copy, states, annotations.

---

## Guardrails
- Never invent research, metrics, component names, or tokens. If you can't find it, say so and ask.
- Never modify the Design Passport library file.
- Ask before large scope assumptions (extra platforms, extra flows).
- Keep the PRD as source of truth; when design and PRD conflict for UX/accessibility reasons, design the better option and flag the conflict for the PM.
