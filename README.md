# MMNL Web Platform: Project Manual

**Compiled:** 4 October 2026, from the full design conversation
**Owner / sole engineer:** Kedar
**Target:** needed in production in about 26 weeks (roughly early April 2027)
**Status:** planning complete enough to start building. Items marked **⚠** still need a decision or a verification.

**How to use this document**
- New engineer: read sections 1-8 and 11, then follow section 13.
- Kedar, day to day: jump to section 13 (build plan) and tick steps off. Everything else is reference.
- When a decision changes, edit section 2 first, then fix whatever it affects. Do not let this file drift from reality.

---

## Table of contents
1. Project context
2. Locked decisions (decision log)
3. Scope: in and out
4. Actors and roles
5. Functional requirements (user stories with acceptance criteria)
6. Status machines
7. Architecture and engineering rules
8. Data model (starting-point schema)
9. Integrations (Ticket Tailor, Google, email, storage)
10. Security, privacy, and compliance
11. Local development environment and how it migrates
12. Hosting, operations, and cost
13. Build plan (28 steps, monthly guide, cut list)
14. Testing and process
15. Runbooks and checklists
16. Open questions, risks, and verification tasks
17. Appendix A: prototype findings
18. Appendix B: original 12-module spec and what changed
19. Appendix C: glossary

---

## 1. Project context

**Name:** Maharashtra Mandal Netherlands (MMNL) Web Platform.

> **Crucial:** MMNL is completely distinct from the "Netherlands Marathi Mandal". Never mix branding, names, or terminology between the two. Check every public-facing string for this.

**Who MMNL is:** a Marathi cultural association in the Netherlands that runs community events such as Ganeshotsav (Ganesh festival). It uses **Ticket Tailor** to sell tickets. Kedar is in charge of the Ticket Tailor account for the organisation this year.

**Objective:** one portal that does three things:
1. **Public event discovery:** people see upcoming and past events and get sent to Ticket Tailor to buy tickets.
2. **Customer account:** logged-in users view their own tickets, register performances, and give feedback.
3. **Internal event operations:** volunteer committees (cultural, sponsorship, logistics/procurement, promotion, decoration) run the event with role-based access.

**People and constraints**
- One engineer (Kedar). AI is used only for small, scoped tasks (boilerplate, single endpoints, test files). Schema design, permission logic, and the Ticket Tailor integration are designed by hand.
- Ship working versions often. A new version can go live whenever a phase finishes.
- Peak load to design for: about **1,000 concurrent users**, mostly browsing public pages (checkout happens on Ticket Tailor).
- Performers: roughly **30 people** per event (people, not acts). The app does **not** enforce a cap. The number only tells us email volume stays far below 100 a day.
- UI language: **English only** for now. Other languages are the lowest priority and come later.
- Domain: a personal domain Kedar already owns (name not recorded here; fill it in under section 12).
- Hosting must **never cold-start** (no free tiers that sleep).

**Existing real-world process the app must respect**
- Media consent for performers is currently collected through a **Google Form**. One group coordinator fills it in for the whole group after collecting every member's name, rather than each performer filling it in individually. The form first asks whether the submission is for a **cultural performance** or a **dhol-tasha group**. It covers use of performers' images and videos in MMNL's social media promotion. The platform's consent design (sections 5 and 10) must build on this practice.

**Prototype:** a clickable demo called "MMNL Platform: Prototype" exists as a claude.ai artifact (single HTML file, in-memory data, resets on reload). It defines the expected look and flow. See Appendix A for what it contains and where it differs from the target design.

---

## 2. Locked decisions (decision log)

| # | Area | Decision |
|---|---|---|
| D1 | Stack | Java 17+ / Spring Boot 3.x backend, PostgreSQL 15+, React 18+ with TypeScript, Tailwind CSS, Shadcn UI. Vite + React Router (not Next). |
| D2 | Auth | Google OAuth 2.0 only. Everyone must have a Google account. |
| D3 | Sessions | HttpOnly session cookie plus CSRF protection. No JWT for login. |
| D4 | Roles | `SUPER_ADMIN` (global) → event admin (per event) → per-department members. Some departments also have a **department admin**. Everyone else is a customer. |
| D5 | Finance access | A toggle the Event Admin or Super Admin sets **when assigning a department role**. It controls whether that person can see finance data. |
| D6 | Payments | All payments are handled by Ticket Tailor. The app never touches card data. |
| D7 | Ticket buying | Event pages **redirect to Ticket Tailor**. No in-app checkout. |
| D8 | Tickets in-app | Logged-in users see **their own tickets** (matched by Google email), per the prototype's customer dashboard. |
| D9 | Refunds | **No refunds are offered** now. Keep an `events.refundable` column (default false) so a per-event setting can exist later. Show a "no refunds" notice on event pages. No refund logic is built. |
| D10 | Performances | Anyone with a Google account can **register a performance**. A cultural department **Member or anyone higher** can approve or reject it. Once approved, the registrant becomes a **performer** for that event and gets performer updates and the ability to upload audio. |
| D11 | Performance timing | The performance request is approved first (usually months ahead). **Audio is uploaded and approved separately**, usually days to a few weeks before the event. |
| D12 | Consent | Performer media consent is collected **when applying for the first time**. Some performers are minors. ⚠ Minor handling is still undecided (see section 10). |
| D13 | Feedback | One response per **buyer email per event**. Shown on the user's dashboard (not via emailed token links), with an email nudge. |
| D14 | Language | English only for now. |
| D15 | Ticket email assumption | Ticket buyers are assumed to buy with their Google login email. A "link another email" feature is deferred. |
| D16 | Performer count | About 30 people per event. No cap enforcement in the app. |
| D17 | Storage | S3-compatible object storage behind a `StorageService` interface. MinIO locally. See section 11. |
| D18 | Hosting | One always-on server (no sleeping free tiers) behind Cloudflare. Estimated about €12-25 a month. See section 12. |
| D19 | Pace | Kedar sets his own pace. The plan gives steps and monthly guidance only. |

---

## 3. Scope

**In scope**
- Public event list and detail pages with a Ticket Tailor link-out.
- Google login, roles and permissions, team management.
- Ticket sync from Ticket Tailor and a "My tickets" page.
- Performance registration, consent, review, performer area, audio, lineup, announcements.
- Sponsorship tracking and complimentary passes.
- Procurement (items, claims, receipts, expense approval) and a finance summary.
- Operations tasks and an asset library.
- Post-event feedback.
- Audit log, privacy features, backups, monitoring.

**Out of scope for v1**
- In-app checkout or any card handling.
- Refund processing.
- Multiple languages (Marathi, Dutch).
- Linking multiple emails to one account.
- Native mobile apps (the site must simply work well on phones).
- Marketing email campaigns.

---

## 4. Actors and roles

| Actor | Who | Scope |
|---|---|---|
| Visitor | Anyone not logged in | Public pages only |
| Customer | Any logged-in Google user | Own tickets, register performances, give feedback |
| Performer | A customer with at least one **approved** performance for an event | Performer area for that event |
| Department Member | Volunteer on a committee | One department in one event |
| Department Admin | Lead of a committee (optional per department) | Their department in one event |
| Event Admin | Runs one event | Everything in that event |
| Super Admin | Platform owner | Everything, all events, and can assign Event Admins |

**Departments:** Cultural, Sponsorship, Logistics (procurement), Promotion, Decoration. Ticketing, surveys, and the whole-event finance view are Event Admin and Super Admin only unless the finance toggle grants access.

**Role rules**
- A role row is `(user, event, department, level, finance_access)`.
    - `level` is an **ordered enum**: `MEMBER` < `ADMIN`. Never compare levels as strings.
    - `finance_access` is one of `NONE`, `OWN_DEPARTMENT`, `WHOLE_EVENT`.
- Event Admin is an event-scoped role with no department. Super Admin is a global flag on the user.
- **Performer is not a role.** It is derived: a user has at least one approved performance for that event. This avoids role churn and handles people who perform in several acts.
- Roles can be **pending**: an admin can assign a role to an email whose owner has not logged in yet. On first Google login (verified email, lowercased), pending roles attach to the new user. Pending roles can be revoked.
- The first Super Admin comes from configuration (environment variable). No UI path may let anyone promote themselves.
- You cannot remove the last Event Admin of an event.
- One person can hold different roles in different events and several departments in one event.

**Draft permission matrix** (⚠ finalise in build step 3, then encode as a table-driven test)

| Action | SA | EA | Dept Admin | Dept Member | Performer | Customer |
|---|---|---|---|---|---|---|
| Create/edit/publish events | ✔ | ✔ (own event) | | | | |
| Assign roles and finance toggle | ✔ | ✔ (own event) | | | | |
| See attendee list, ticketing module | ✔ | ✔ | | | | |
| Whole-event finance dashboard | ✔ | ✔ | if flag `WHOLE_EVENT` | if flag `WHOLE_EVENT` | | |
| Own-department finance | ✔ | ✔ | if flag ≥ `OWN_DEPARTMENT` | if flag ≥ `OWN_DEPARTMENT` | | |
| Register a performance | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Approve/reject performance registration | ✔ | ✔ | Cultural ✔ | Cultural ✔ | | |
| Review/approve audio | ✔ | ✔ | Cultural ✔ | Cultural ✔ (proposed) | | |
| Manage and lock lineup, post performer announcements | ✔ | ✔ | Cultural ✔ | | | |
| Upload audio, see performer area | | | | | ✔ (own acts) | |
| Sponsor CRUD | ✔ | ✔ | Sponsorship ✔ | Sponsorship ✔ | | |
| Record sponsor payments, issue comp passes | ✔ | ✔ | Sponsorship ✔ | | | |
| Define procurement items, approve expenses | ✔ | ✔ | Logistics ✔ | | | |
| Claim procurement items, submit receipts | ✔ | ✔ | Logistics ✔ | Logistics ✔ | | |
| Create/assign tasks (Promotion, Decoration) | ✔ | ✔ | own dept ✔ | | | |
| Update own tasks, upload/download assets | ✔ | ✔ | own dept ✔ | own dept ✔ | | |
| View survey results | ✔ | ✔ | | | | |
| Submit survey | | | | | | checked-in buyer only |
| View own tickets | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |

Rows marked "proposed" are my suggestions, not confirmed decisions. Settle them in step 3.

---

## 5. Functional requirements (user stories with acceptance criteria)

Roles in the stories: Visitor, Customer, Performer, Dept Member, Dept Admin, Event Admin, Super Admin.

### E1. Identity and access
- **1.1 Visitor signs in with Google.**
  *AC:* first login creates a Customer. Session cookie is HttpOnly, Secure, SameSite. Logout destroys the server-side session. Only Google-verified emails are accepted.
- **1.2 Super Admin manages top-level access.**
  *AC:* can grant or revoke Super Admin and assign Event Admins. First Super Admin comes from config. No self-promotion path.
- **1.3 Event Admin adds a team member by email.**
  *AC:* works even if the person has never logged in (shows as "pending", attaches on first login by verified email). Pending roles can be revoked.
- **1.4 Event Admin changes or removes a role.**
  *AC:* takes effect on the next request. Audit-logged. The last Event Admin of an event cannot be removed.
- **1.5 Role holder switches between public site and admin portal, and between events.**
  *AC:* the "Admin portal" toggle appears only if the user holds at least one role.
- **1.6 Customer exports and deletes their data.**
  *AC:* deletion anonymises records that finance still needs.

### E2. Events
- **2.1 Event Admin creates a draft event.**
  *AC:* fields: title, description, venue, dates, banner, Ticket Tailor link, `refundable` flag (default false). Drafts are never public.
- **2.2 Event Admin publishes, unpublishes, and completes an event.**
  *AC:* state machine rejects invalid transitions. Completing an event opens feedback (E9).
- **2.3 Visitor browses upcoming events and opens a detail page.**
  *AC:* shows description, venue, date, a "Get tickets" button that goes to Ticket Tailor, and a "no refunds" notice. Works on mobile.
- **2.4 Visitor views past events.**
  *AC:* ticket button is hidden for them.

### E3. Tickets
- **3.1 Customer sees their tickets.**
  *AC:* card per ticket with event, venue, date, ticket type, status (issued, checked in, cancelled), ticket ID, and QR/barcode from Ticket Tailor. Matched by verified Google email, including tickets bought before first login. If none match, show a help message that explains tickets are matched by the Google email used at checkout.
- **3.2 Event Admin sees ticket sales and check-ins.**
  *AC:* attendee count, check-ins, sales by type. New Ticket Tailor orders appear within about a minute.
- **3.3 System ingests Ticket Tailor webhooks.**
  *AC:* signature-verified, idempotent (a replay changes nothing), raw payload stored. A reconciliation job re-pulls recent orders to repair missed webhooks.
- **3.4 Event Admin searches attendees.**
  *AC:* by name or email. Only Event Admin and Super Admin can.

### E4. Performances (revised flow)

**Lifecycle in one line:** register (with participants and consent) → approved by cultural Member or higher → performer area → upload audio → audio approved → lineup.

- **4.1 Any logged-in user registers a performance.**
  *AC:* fields include group name, **type (cultural performance or dhol-tasha group)**, duration, description, and a **participant list** (name, minor yes/no, guardian name and email for minors). Consent is recorded per participant (see 4.4). Drafts can be saved. Audio is **not** required at registration.
- **4.2 Event Admin sets deadlines.**
  *AC:* a registration deadline and a later audio deadline per event. Registrations close after the deadline. Cultural Admin can grant exceptions.
- **4.3 Registrant sees status and comments.**
  *AC:* status Registered, Approved, Rejected, or Withdrawn, with a reason on rejection. Every status change sends an email. A rejected act can be edited and resubmitted.
- **4.4 Consent is captured at registration.**
  *AC:* one consent record per participant per event, with a `method` field (for example `lead_attested` or `self_confirmed`), who recorded it, and a timestamp. Minors require guardian contact. Cultural Admin sees a consent-completeness indicator per act. Withdrawal of consent flags the act for the admin. ⚠ Design for the legal question in section 10.
- **4.5 Cultural Member or higher reviews registrations.**
  *AC:* approve or reject with a reason; the reason is emailed.
- **4.6 Approved registrant becomes a performer.**
  *AC:* performer area for that event shows announcements, a status checklist (registered, approved, consent complete, audio uploaded, audio approved), and the audio upload control.
- **4.7 Performer uploads audio (after approval).**
  *AC:* mp3/wav only, file-signature validated, size limit, presigned direct upload to a private bucket, progress shown, replaceable until approved. Status becomes Uploaded.
- **4.8 Cultural reviewer reviews audio.**
  *AC:* in-row audio player in the review table (no download needed). Approve, or request changes with a reason (emailed). Admins can see which approved performers have not uploaded audio.
- **4.9 Cultural Admin builds the lineup.**
  *AC:* order approved acts with simple move up/down controls (about 30 people means no drag-and-drop library is needed), see total running time, lock the lineup, and export a run sheet (PDF or CSV). Warn when audio or consent is missing; overrides are audit-logged.
- **4.10 Cultural Admin posts performer announcements.**
  *AC:* emailed to approved performers and shown in the performer area. Reminders before the audio deadline.

### E5. Sponsorship
- **5.1 Dept Member adds a sponsor.**
  *AC:* company, tier (Gold, Silver, Bronze in the prototype), contact, pledged amount, status, optional logo. Status moves prospect → committed → paid.
- **5.2 Dept Admin records payments.**
  *AC:* each partial payment is its own record. "Paid" is the sum. A progress bar shows pledged vs paid.
- **5.3 Dept Admin issues complimentary passes.**
  *AC:* cannot exceed the tier's allotment (prototype tracks allotted vs issued), can be voided, and shows as complimentary in the attendee list. ⚠ Depends on whether the Ticket Tailor API can issue free tickets (see section 9). Fallback: create the pass in Ticket Tailor by hand and log it here.
- **5.4 Visitor sees sponsor logos by tier on the event page.**
  *AC:* only sponsors marked public appear.

### E6. Procurement (Logistics)
- **6.1 Dept Admin defines needed items.**
  *AC:* name, required quantity, estimated cost, deadline. Required quantity cannot drop below what is already claimed.
- **6.2 Dept Member claims part of an item.**
  *AC:* can edit or cancel a claim. Two simultaneous claims can never exceed the required quantity (transaction or row lock plus DB constraint).
- **6.3 Dept Member submits a receipt and actual cost.**
  *AC:* image or PDF only, stored in private storage.
- **6.4 Dept Admin approves or rejects expenses.**
  *AC:* reason required on rejection. Only approved expenses count in finance. ⚠ Confirm who approves: proposed Logistics Admin, with Event Admin override.
- **6.5 Event Admin sees reimbursement owed.**
  *AC:* per-person totals, and can mark reimbursed.

### E7. Finance
- **7.1 Authorised user sees the finance summary.**
  *AC:* ticket revenue, sponsor income, approved expenses, net. Visibility follows the finance toggle (D5). CSV export. Subtract any ticket fees if Ticket Tailor exposes them.
- **7.2 Budget vs actual per department.** Optional, later.

### E8. Operations
- **8.1 Promotion campaign tracker** (from the prototype): list of campaigns with platform, status (for example Live, Scheduled, Done), and notes.
- **8.2 Dept Admin creates and assigns tasks** with due dates and department. Assignees are notified.
- **8.3 Dept Member updates status of own tasks** (To do, In progress, Done). Members cannot touch others' tasks. Dept Admin can touch any in their department. The prototype shows Decoration as a three-column Kanban. Build a list first, add Kanban last.
- **8.4 Asset library:** upload and download files (flyers, logos, floor plans), filterable by category.
- **8.5 My tasks across events** for a role holder.

### E9. Feedback
- **9.1 Completing an event opens a survey** for checked-in buyers.
  *AC:* shown on the user's dashboard (matched by Google email), plus an email nudge with opt-out. No token or JWT machinery.
- **9.2 Buyer submits feedback.**
  *AC:* ratings 1-5 for overall, food, cultural, and venue (the prototype's four categories) plus an optional comment. **One response per buyer email per event**, enforced by a DB unique constraint.
- **9.3 Event Admin views results.**
  *AC:* averages per category and anonymous comments.

### E10. Platform-wide
- Every admin action writes an audit record (who, what, when).
- Works well on phones. Most attendees will use one.
- Privacy policy, retention rules, email opt-out (section 10).
- Backups with a tested restore (section 12).
- English-only UI, but keep user-facing strings in one place so translation is possible later.

---

## 6. Status machines

| Entity | States and transitions |
|---|---|
| Event | `DRAFT` ↔ `PUBLISHED` → `COMPLETED`. Invalid transitions rejected. |
| Performance registration | `REGISTERED` → `APPROVED` or `REJECTED`. `APPROVED` → `WITHDRAWN`. `REJECTED` → `REGISTERED` on resubmission. |
| Performance audio | `NOT_UPLOADED` → `UPLOADED` → `AUDIO_APPROVED` or `CHANGES_REQUESTED`. `CHANGES_REQUESTED` → `UPLOADED`. |
| Ticket | `ISSUED`, `CHECKED_IN`, `CANCELLED` (prototype values). `REFUNDED` reserved for later. |
| Sponsor | `PROSPECT` → `COMMITTED` → `PAID`. |
| Procurement item | Pending → Partially claimed → Fully claimed → Purchased (prototype uses Pending, Partially claimed, Purchased). |
| Expense | `SUBMITTED` → `APPROVED` or `REJECTED`. `APPROVED` → `REIMBURSED`. |
| Task | `TODO` → `IN_PROGRESS` → `DONE`. |
| Survey | `DRAFT` → `OPEN` → `CLOSED`. |
| Role assignment | `PENDING` (email not yet registered) → `ACTIVE`; `REVOKED` at any time. |

---

## 7. Architecture and engineering rules

**Shape**
- **Modular monolith.** One Spring Boot application, packages by feature (`identity`, `events`, `tickets`, `cultural`, `sponsorship`, `procurement`, `finance`, `ops`, `feedback`, `audit`, `storage`, `mail`). Modules talk through service interfaces only. Use ArchUnit tests to enforce that no module reaches into another's repositories.
- Modules do not couple their tables beyond foreign keys on `event_id` and `user_id`.
- **One domain.** Serve the React build and `/api` from the same site behind one reverse proxy. That removes CORS and simplifies cookies and CSRF.
- All endpoints are prefixed `/api/v1/`.

**Auth and permissions**
- Spring Security `oauth2Login()` with Google. On success: look up the user by lowercased verified email; if missing, create a Customer; attach any pending role assignments.
- **Spring Session JDBC** so deploys do not log everyone out.
- CSRF: cookie-based token that the SPA echoes in a request header.
- **One `PermissionService`** (or a `@Component("permEvaluator")` used from `@PreAuthorize`), **deny by default**. Inputs: user, event, department, minimum level, finance requirement. Role level is an ordered enum.
- **IDOR is the main security risk.** Every resource lookup must verify the resource belongs to the `eventId` in the URL **and** that the caller has a role for that event. Write tests for this.
- Use UUIDs as public IDs for tickets, submissions, and files so they cannot be enumerated.

**Data**
- Money as **integer cents plus currency**. Times as `timestamptz`, displayed in Europe/Amsterdam.
- Enforce invariants with DB constraints, not only code: unique survey response per buyer email per event, claim totals, one role row per (user, event, department).
- **Flyway** for migrations. Never edit an applied migration; add a new one.
- Append-only `audit_log` table from day one.
- Email goes through an **outbox table** so failures retry.
- Ticket Tailor webhooks are stored in a `webhook_events` table with an idempotency key and processed asynchronously.

**API and frontend**
- JSON naming: **camelCase** end to end (configure Jackson once).
- Generate TypeScript types from an OpenAPI spec (springdoc plus openapi-typescript) so DTOs cannot drift.
- Server state: React Query. Auth state: Zustand or React Context holding `{ id, email, globalRole, eventRoles[] }`. No Redux.
- Forms: React Hook Form with Zod.
- UI: Shadcn UI with Tailwind. Brand colours include saffron `#FF9933` and slate. Mobile-first. Layout wrappers: `PublicLayout` (header, footer) and `DashboardLayout` (sidebar, event switcher). A `<ProtectedRoute>` guard checks roles. The header shows "Switch to Admin Portal" only for users who hold a role.

**Process**
- Trunk-based development, CI on every push, a staging environment, and config flags to hide unfinished modules so you can ship weekly.

---

## 8. Data model (starting-point schema)

This is a proposal to be finalised in build step 2. Every prototype screen must map to a table. Add `created_at`, `updated_at`, and (where useful) `created_by` to everything.

| Table | Key columns |
|---|---|
| `users` | id, email (unique, lowercased), full_name, is_super_admin, google_subject, created_at |
| `events` | id, title, description, venue, starts_at, ends_at, banner_key, status, ticket_tailor_url, ticket_tailor_ref, refundable (default false), registration_deadline, audio_deadline, capacity |
| `role_assignments` | id, event_id, user_id (nullable while pending), pending_email, department (null for Event Admin), level, finance_access, status, assigned_by |
| `tickets` | id (uuid), ticket_tailor_ticket_id (unique), ticket_tailor_order_id, event_id, user_id (nullable), buyer_email, attendee_name, ticket_type, barcode, status, price_paid_cents, currency, is_complimentary |
| `webhook_events` | id, provider, idempotency_key (unique), signature_ok, payload, received_at, processed_at, error |
| `performances` | id (uuid), event_id, submitted_by, group_name, type (CULTURAL / DHOL_TASHA), duration_minutes, description, status, status_reason, lineup_position, lineup_locked |
| `performance_audio` | id, performance_id, storage_key, original_filename, mime, size_bytes, status, reviewer_id, reviewer_note |
| `participants` | id, performance_id, full_name, is_minor, guardian_name, guardian_email |
| `consents` | id, participant_id, event_id, scope (photo/video promotion), given (bool), method, recorded_by, recorded_at, withdrawn_at |
| `announcements` | id, event_id, author_id, subject, body, sent_at |
| `sponsors` | id, event_id, company, contact_name, contact_email, tier, pledged_cents, status, comp_allotted, is_public, logo_key |
| `sponsor_payments` | id, sponsor_id, amount_cents, paid_on, note |
| `comp_passes` | id, sponsor_id, ticket_id (nullable), recipient_email, ticket_type, voided_at |
| `procurement_items` | id, event_id, name, required_quantity, estimated_cost_cents, deadline |
| `procurement_claims` | id, item_id, user_id, quantity, status; constraint: total claimed ≤ required |
| `expenses` | id, claim_id, amount_cents, receipt_key, status, approved_by, reimbursed_at |
| `campaigns` | id, event_id, platform, status, notes |
| `tasks` | id, event_id, department, title, description, status, assignee_id, due_date, file_key |
| `assets` | id, event_id, department, category, storage_key, filename, uploaded_by |
| `surveys` | id, event_id, status |
| `survey_responses` | id, survey_id, buyer_email, overall, food, cultural, venue, comment; unique (survey_id, buyer_email) |
| `email_outbox` | id, to_email, template, payload, status, attempts, next_attempt_at |
| `audit_log` | id, at, actor_id, event_id, action, entity_type, entity_id, detail (json) |

Notes
- Store **object keys**, never URLs. Presigned URLs are generated per request.
- Finance numbers are derived from `tickets`, `sponsor_payments`, and approved `expenses`, never typed in by hand.
- The original spec's `survey_responses` unique-per-ticket rule is **replaced** by unique-per-buyer-email-per-event.

---

## 9. Integrations

### 9.1 Ticket Tailor
**Role in the system:** checkout and payments (D6, D7). The app links out for purchase and syncs ticket data back.

**Do in the first spike (1-2 days, build step 1)**
- ⚠ What the API exposes: orders, issued tickets, events, event series/box office, barcodes, fees.
- ⚠ Webhook details: event names, signature header name, signature algorithm, retry behaviour. The original spec assumed `order.created`, `ticket.issued`, `ticket.checked_in`, and a header called `X-TicketTailor-Signature`. **Treat all of those as unverified until checked against the current docs.**
- ⚠ Whether the API can create events. The new design **does not need it** (events are created in Ticket Tailor and linked by URL/reference), so this is only for curiosity.
- ⚠ Whether the API can issue complimentary tickets (needed for E5.3). If not, use the manual fallback.
- ⚠ Whether Ticket Tailor has a test or sandbox mode. If not, use a hidden test event with a free ticket type.
- Whether the checkout page or widget keys off an event series or box office rather than a single event.

**Rules**
- Hide Ticket Tailor behind your own interface (`TicketProvider`). No Ticket Tailor types leak into the rest of the code.
- Verify the signature against the **raw request body** before parsing.
- Store every webhook, process asynchronously, make processing idempotent.
- Run a **reconciliation job** that re-pulls recent orders so missed webhooks self-heal.
- Ticket Tailor is the source of truth for money. Store fees separately if exposed.
- Match tickets to users by lowercased buyer email. Ticket rows with no matching user keep `user_id` null and link when that person first logs in.

### 9.2 Google OAuth
- One Google Cloud project with **separate OAuth clients for development and production** (different redirect URIs).
- Only accept emails where Google reports the email as verified.
- Role and ticket matching always uses the lowercased verified email.

### 9.3 Email
- Transactional provider with SPF, DKIM, and DMARC set up on your domain. Send through the outbox table.
- Candidates and limits as of October 2026 research (⚠ verify before choosing): Resend free tier is 3,000 emails a month but capped at 100 a day, Pro is about $20 a month for 50,000. Postmark paid starts around $15 a month for 10,000. Amazon SES is about $0.10 per 1,000 emails.
- With about 30 performers per event, the free tier is enough in normal use.
- Emails the system sends: registration received, approved/rejected (with reason), audio approved/changes requested, performer announcements and reminders, role assigned, survey nudge. All include an opt-out where marketing-like.
- Locally, use **Mailpit** (see section 11) so no real email is ever sent from development.

### 9.4 Object storage
- S3-compatible, EU region, behind a `StorageService` interface with `uploadFile`, `delete`, `getPresignedUrl` (read) and a presigned-upload method.
- Candidates: Cloudflare R2 (no egress fees; ⚠ check EU data location), Backblaze B2, Scaleway, Hetzner object storage. Compare current prices when you choose.
- Private buckets only. Short-lived presigned GET URLs for playback and downloads.
- Key scheme examples: `events/{eventId}/audio/{uuid}.mp3`, `events/{eventId}/receipts/{uuid}`, `events/{eventId}/assets/{uuid}`.

---

## 10. Security, privacy, and compliance

**Application security**
- CSRF protection on all state-changing requests. Secure, HttpOnly, SameSite cookies.
- Deny-by-default permission checks, event-scoped on every endpoint, with IDOR tests.
- Uploads: allow-list file types, validate file signatures (not just the declared MIME type), enforce size limits, upload directly to storage with presigned URLs, never serve user files from the app domain.
- Rate limits on login callbacks, uploads, and public endpoints.
- Security headers (CSP, HSTS, X-Content-Type-Options, frame protections).
- Secrets only in environment variables or a secrets store. Never in git.
- Audit log for role changes, approvals, finance actions, lineup overrides, and consent changes.

**Privacy (GDPR / AVG, Netherlands)**
- You will hold emails, names, performer details, audio, receipts, and possibly minors' data. Publish a privacy policy and have a clear retention rule per data type.
- Provide data export and deletion for customers (story 1.6). Anonymise rather than delete records finance still needs.
- Keep data in the EU where you can.
- Emails that are not strictly transactional need an opt-out.
- Backups also contain personal data. Encrypt them and apply the retention rule.

**Consent for performers and minors (⚠ open, needs a decision with the Mandal)**
- Current practice: one group coordinator fills a Google Form for the whole group. For adults, a coordinator ticking consent on behalf of everyone may not count as valid consent from each person. For minors, consent normally has to come from a guardian.
- The platform stores consent **per participant** with a `method` field. That lets you start with `lead_attested` (matching today's process) and add a `self_confirmed` or guardian email-link flow later without changing the data model.
- For minors, store only an `is_minor` flag plus guardian name and email. Do **not** store dates of birth.
- I believe the Dutch age threshold for consent to data processing is 16, and image rights for under-18s are a separate consideration. I am not a lawyer. ⚠ Confirm both with the Mandal, and ideally a lawyer, before launch.
- Cultural Admin must be able to see which acts have complete consent and which do not, and locking the lineup warns on gaps.

---

## 11. Local development environment and how it migrates

**Principle:** development, CI, staging, and production run the **same components**, configured only by environment variables. A local component is either the same software as production (Postgres), a protocol-compatible stand-in (MinIO for S3, Mailpit for an email provider), or a tunnel to a real service (Ticket Tailor webhooks). Nothing in application code should know which environment it is in beyond configuration.

### 11.1 Tools to install on your machine

| Tool | Why | Notes |
|---|---|---|
| JDK 17+ (21 LTS recommended) | Spring Boot 3.x backend | Spec says 17+. Pin the same version in CI and the production image. |
| Maven or Gradle | Build | Pick one and use its wrapper (`mvnw` / `gradlew`) so everyone builds the same way. |
| IDE (for example IntelliJ IDEA) | Backend work, DB browsing | Any is fine. |
| Node.js LTS + npm or pnpm | Frontend build | Pin the version in `.nvmrc` or `engines`. |
| Docker (Docker Desktop, Colima, or Podman) + Compose | Runs Postgres, MinIO, Mailpit locally; required by Testcontainers | Everything below runs from one `docker-compose.yml`. |
| Git + GitHub | Source control; GitHub Actions for CI | Trunk-based, short-lived branches. |
| DB client (DBeaver, pgAdmin, or IDE) | Inspect data | |
| API client (Bruno, Postman, or HTTPie) | Manual API testing | Commit collections to the repo, without secrets. |
| Tunnel (Cloudflare Tunnel `cloudflared`, or ngrok) | Lets Ticket Tailor send webhooks to your laptop | Only used while developing webhook code. |
| rclone | Copy objects between buckets (migration and backups) | |
| `pg_dump` / `pg_restore` (come with Postgres client tools) | Database backup and restore | |
| Playwright | A few end-to-end browser tests | |

### 11.2 Services in the local Docker Compose file

| Service | Image idea | Replaces in production | Purpose |
|---|---|---|---|
| `postgres` | Postgres with the **same major version** as production (15+; pick one and pin it) | Postgres on the server | Main database and Spring Session store |
| `minio` | MinIO | S3-compatible provider (R2, B2, Scaleway, etc.) | Audio, receipts, assets, backups. Create buckets and set **CORS** so browser presigned uploads work. |
| `mailpit` | Mailpit | Transactional email provider | Catches every outgoing email in a local inbox UI. No real mail leaves your machine. |
| (optional) `app` and `web` | Built images | Same images in production | Only to test the container build locally. Day to day, run the backend from the IDE and the frontend with Vite's dev server. |

The Vite dev server proxies `/api` to the Spring Boot app, which mimics the "one domain" production setup and avoids CORS.

### 11.3 Configuration and secrets
- Spring profiles: `dev`, `test`, `prod`. All environment-specific values come from **environment variables**. Commit a `.env.example`, never a real `.env`.
- Variables to define (names are suggestions): database URL, user, password; Google OAuth client id and secret; storage endpoint, region, bucket, access key, secret, path-style flag; mail provider settings; Ticket Tailor API key and webhook secret; initial Super Admin email; session and CSRF settings; public base URL.
- **Dev seed data** (a dev-only profile or migration): demo accounts for each role like the prototype's demo picker, and sample events. **Never load seed data in production.** Production gets only a bootstrap: the first Super Admin from config.

### 11.4 Migration map: local → CI/staging → production

| Component | Local | Production | How you move it |
|---|---|---|---|
| Database schema | Postgres container | Postgres on the server (or managed Postgres later) | **Flyway runs on application startup.** No manual schema copying. Same migrations everywhere. |
| Database data | Disposable dev data | Real data | Do **not** copy dev data to production. If you ever move production to a new host: `pg_dump` → copy → `pg_restore`, with a short maintenance window. |
| Object storage | MinIO | R2 / B2 / Scaleway / etc. | Change endpoint, credentials, bucket, and region in config. For real files: `rclone sync` old bucket → new bucket, verify counts and sample files, switch config, redeploy. Keys in the database stay valid because you store keys, not URLs. Re-apply CORS on the new bucket. |
| Email | Mailpit | Real provider | Swap provider settings. Before first send: add SPF, DKIM, DMARC DNS records and send a test to a few inboxes. |
| Frontend serving | Vite dev server with proxy | Static build served by the reverse proxy (or a static host/CDN) with `/api` forwarded to Spring Boot | CI builds the frontend; production serves the build. Same-origin so cookies and CSRF behave like dev. |
| Reverse proxy and TLS | None | Caddy (or similar) on the server, behind Cloudflare | Only exists in production and staging. Keep its config file in the repo. |
| Webhooks | Tunnel URL pointing at your laptop | Stable HTTPS URL on your domain | Register the production webhook URL in Ticket Tailor. Remove the tunnel registration. Use a separate webhook secret per environment. |
| Google OAuth | Dev OAuth client (localhost redirect) | Production OAuth client (domain redirect) | Two separate clients with separate secrets. Add the production redirect URI before launch and check the consent screen. |
| Containers | Compose on your machine | The same Compose (with a production override file) on the server | CI builds images and pushes them to a registry (for example GitHub Container Registry). The server pulls and restarts. |
| Secrets | `.env` file (gitignored) | Environment file on the server with tight permissions, or the host's secret store | Rotate any secret that has ever been pasted into chat, email, or a log. |
| DNS and CDN | n/a | Cloudflare in front of the server | Lower DNS TTL a day before any server move so cutover is quick. |
| Monitoring | Console logs | Error tracker, uptime monitor, health endpoint | Same code, configured via environment variables. |

**Moving hosting provider later**
1. Provision the new server and deploy with the same Compose files.
2. Restore the latest database backup there and test.
3. Lower the DNS TTL, announce a short read-only window, take a final dump, restore, run Flyway, switch DNS.
4. Keep the old server for a few days as a fallback, then delete it.

---

## 12. Hosting, operations, and cost

**Topology (recommended)**
- DNS and CDN: **Cloudflare free plan** in front of everything (TLS, caching, DDoS protection).
- Frontend: static build. It can be served by the same server or a static host. A static host keeps public pages up even if the API restarts.
- Backend: one always-on **2 vCPU / 4 GB** server running Docker Compose: Caddy, the Spring Boot app, and Postgres.
- Object storage: separate S3-compatible provider. **Database backups go to a separate bucket, ideally at a different provider**, so one account problem cannot remove both data and backups.
- Cache the public event list and detail endpoints so 1,000 browsing users hit the cache, not the database.
- Avoid free app hosts that sleep and free databases that pause. They cause the cold-start problem.

**Estimated monthly cost (excluding Dutch VAT of 21%)**

| Item | Estimate |
|---|---|
| Server (2 vCPU, 4 GB, includes Postgres) | about €10-20 |
| Domain | €0 (already owned) |
| Cloudflare DNS, CDN, TLS | €0 |
| Object storage (audio, receipts, backups) | about €0-3 (⚠ verify current pricing) |
| Email | €0 (free tier covers about 30 performers); about $15-20 only if you outgrow it |
| Uptime monitor and error tracking (free tiers) | €0 |
| **Total** | **roughly €12-25 a month** |

**⚠ Server pricing is unstable in 2026.** Hetzner raised cloud prices more than once this year (April and June). Reports in August and September showed its cheapest Cost-Optimized plans marked unavailable at times, and one August comparison listed the CX23 near €5.49 and a 2 vCPU CPX22 near €19.49 a month. Check live availability and prices, and compare other EU providers in the €10-25 range. Budget for the 4 GB tier at about €20.

**"Never down" realism**
- One server plus Cloudflare gives roughly 99.9% in practice. That still allows a few minutes of downtime for deploys or reboots. Use graceful restarts and deploy outside event days.
- True high availability (two app servers, managed database, load balancer) costs roughly €70-120 a month and is not justified for community events. Spend effort on **tested backups** and **monitoring** instead.
- Set up: health endpoint, external uptime check with alerts, error tracking, log rotation, automatic container restart, OS security updates.

**Backups**
- Nightly `pg_dump` to the backup bucket, with retention (for example 14 daily and a few monthly). Encrypt. **Do one real restore test** before launch and repeat it on a schedule.
- Object storage: keep versioning or a periodic `rclone` copy of the audio, receipts, and assets bucket.

---

## 13. Build plan (28 steps, monthly guide, cut list)

Pace is yours. Each step has a "done when". Ship a version at the marked points.

### Phase A: Foundations
1. **Ticket Tailor spike (1-2 days).** Answer every ⚠ in section 9.1. *Done when:* a test purchase hits a local webhook endpoint (via tunnel) and you know which features need manual fallbacks.
2. **Finalise the data model** (section 8) so every prototype screen maps to tables.
3. **Finalise the permission matrix** (section 4), including the finance flag and the "approved performer" rule.
4. **Skeleton and deploy pipeline.** Spring Boot, Postgres, Flyway, Vite app, CI, reverse proxy, HTTPS on your domain. *Done when:* a push to main deploys automatically.
5. **Auth.** Google login, session cookie, CSRF, config-seeded first Super Admin, `/me`, frontend route guard. *Done when:* you can log in on production.
6. **Events.** Admin CRUD, draft/published/completed, public list and detail pages with Ticket Tailor link-out, `refundable` field, "no refunds" notice. *Done when:* **v0.1 is public.**
7. **Ticket sync and My Tickets.** Verified webhook, stored raw events, idempotent processing, reconciliation job, ticket cards matching the prototype. *Done when:* a real test ticket shows for the right Google account.

### Phase B: Access control
8. **Permission service** with ordered levels, deny-by-default, event-scoped checks. *Done when:* the matrix runs as automated tests, including IDOR cases.
9. **Team management.** Assign department, level, and finance access; pending roles by email; audit log entries. *Done when:* you can build a committee from the UI. **v0.2.**
10. **Admin shell.** Sidebar showing only permitted modules and an event switcher.

### Phase C: Performances
11. **Registration form.** Act details, type (cultural or dhol-tasha), participant list with minor flag and guardian contact, consent per participant with a `method` field. *Done when:* a Customer can submit and see "Registered".
12. **Review queue.** Cultural Members or higher approve or reject with a reason; email the registrant.
13. **Performer area** for approved acts: announcements and status checklist.
14. **Audio upload** (opens after approval). Presigned direct upload, type and size checks, private bucket. **Test against the real production storage provider here**, not at launch (watch presigned URL signing, CORS, max object size).
15. **Audio review.** In-row player, approve or request changes with a reason.
16. **Lineup.** Move up/down ordering, total runtime, lock, run-sheet export, warnings for missing audio or consent. **v0.3.**
17. **Announcements and deadlines.** Post updates to approved performers, plus registration and audio deadlines with reminders.

### Phase D: Money and logistics
18. **Sponsorship.** Sponsors, partial payments, tier entitlements, public sponsor logos.
19. **Comp passes.** Only if the spike shows the API can issue them; otherwise log manually created passes.
20. **Procurement.** Items, claims table with transactional claim checks, receipts, expense approval, reimbursement tracking.
21. **Finance summary** with flag-based visibility. Check it against a spreadsheet for one real event. **v0.4.**

### Phase E: Operations and feedback
22. **Tasks, campaigns, and assets.** Start with lists and file uploads. Add Kanban last.
23. **Surveys.** Four ratings plus a comment, one response per buyer email per event, dashboard prompt, email nudge, averages for admins.

### Phase F: Launch readiness
24. **Hardening.** Rate limits, upload validation, security headers, IDOR test pass.
25. **Privacy.** Privacy policy, retention rules, export and deletion, email opt-outs, and the consent/minors check with the Mandal.
26. **Operations.** Nightly backups, a real restore test, uptime monitor, error tracking, runbook.
27. **Load test** a realistic public-browsing scenario at about 1,000 concurrent users.
28. **Pilot** with the real committee on a small event, fix what they hit, then launch **v1.0**.

### Monthly guide (26 weeks)

| Month | Calendar (approx.) | Aim to finish |
|---|---|---|
| 1 | Oct-early Nov 2026 | Steps 1-7 |
| 2 | Nov-early Dec 2026 | Steps 8-10, start 11-12 |
| 3 | Dec 2026-early Jan 2027 | Steps 11-17 |
| 4 | Jan-early Feb 2027 | Steps 18-21 |
| 5 | Feb-early Mar 2027 | Steps 22-26 |
| 6 | Mar-early Apr 2027 | Steps 27-28 plus buffer |

Aim to finish features by the end of month 5. Month 6 is for the pilot and fixes. Exams and TA work will take some weeks, so protect the buffer.

**Cut list if you fall behind (in this order):** Kanban board (step 22), comp-pass automation (step 19), finance charts and budget-vs-actual (step 21), survey email nudge (step 23). A Google Sheet covers the cut items until later.

**Order flexibility:** steps 1-10 should stay in order because everything depends on them. Reorder steps 11-23 by what the Mandal needs for its next real event.

**Where to use AI and where not**
- Good for AI: boilerplate, single endpoints, a test file, a form component, an email template, a Flyway migration draft you will review.
- Do yourself: schema, permission logic and tests, the Ticket Tailor integration design, consent and privacy decisions, anything touching money.

---

## 14. Testing and process

- **Integration tests** with Testcontainers against real Postgres (and MinIO where uploads matter). Do not mock the database.
- Test only where bugs are expensive:
    - the permission matrix (table-driven, including finance flag and IDOR cases);
    - webhook signature and idempotency (replays must change nothing);
    - procurement claim concurrency (two simultaneous claims cannot oversubscribe);
    - finance math (cross-check against a spreadsheet);
    - the audio and lineup state machines.
- A few **Playwright** flows: log in, view tickets, register a performance, approve it, upload audio.
- CI on every push: build, unit and integration tests, lint, ArchUnit module-boundary tests.
- Staging environment mirroring production, with config flags hiding unfinished modules.
- Keep an `ARCHITECTURE.md` or this manual up to date. Record each new decision in section 2.

---

## 15. Runbooks and checklists

**New developer onboarding**
1. Read sections 1-8 and 11.
2. Install the tools in 11.1, copy `.env.example` to `.env`, run `docker compose up`.
3. Run the backend with the `dev` profile (Flyway migrates and dev seed loads), run the frontend with Vite, log in with a dev Google OAuth client.
4. Run the full test suite once.
5. Pick a step from section 13.

**Deploy**
1. Merge to main, CI builds and tests, builds images, pushes to the registry.
2. Server pulls new images and restarts with a graceful restart. Flyway migrates on startup.
3. Check the health endpoint and one smoke flow. Roll back by redeploying the previous image tag. Migrations must be backward compatible for at least one release so rollback is safe.

**Backup and restore drill (do before launch, then periodically)**
1. Take a dump from production backup storage.
2. Restore into a fresh Postgres.
3. Start the app against it and confirm key data is present.

**Ticket Tailor webhook recovery**
1. Check `webhook_events` for failures.
2. Fix the cause, then reprocess the stored payloads (they are idempotent).
3. Run the reconciliation job to catch anything that never arrived.

**Setting up a new event**
1. Create the event in Ticket Tailor first.
2. Create the draft event in the platform and paste the Ticket Tailor link/reference.
3. Set `refundable` (false), registration and audio deadlines, capacity.
4. Assign the Event Admin, then department roles (with the finance toggle).
5. Publish when ready.

**Incident basics**
- Site down: check uptime monitor, health endpoint, container status, disk space, database connectivity, then recent deploys. Roll back first, investigate second.
- Suspected data exposure: revoke affected sessions, rotate secrets, check the audit log, and follow the privacy policy's notification duties (⚠ confirm obligations with the Mandal).

---

## 16. Open questions, risks, and verification tasks

**Decisions still open**
1. ⚠ **Consent for performers and minors:** is lead-attested consent acceptable for launch, and how are minors handled (guardian link, paper form, or Google Form fallback)? Confirm age thresholds and image-rights rules.
2. ⚠ **Permission details:** who approves audio (proposed Cultural Member or higher), who approves expenses (proposed Logistics Admin with Event Admin override), and the exact matrix in section 4.
3. ⚠ **Comp passes:** automated through the API, or created by hand in Ticket Tailor?
4. ⚠ **Mismatched emails:** a ticket bought with a non-Google or different email will not show up. Decide later whether to add "link another email" (deferred, D15).
5. ⚠ **Who is eligible for the survey** when a ticket was bought by one person for several attendees (current rule: the buyer email, one response per event).
6. ⚠ **Choice of providers:** server host, object storage, email provider (compare current prices at the time).
7. ⚠ **Domain details:** record the domain, DNS host, and registrar in this file.

**Risks**
| Risk | Mitigation |
|---|---|
| Ticket Tailor API or webhooks differ from assumptions | Do the spike first; keep a manual fallback for comp passes; reconcile by polling |
| Solo engineer, long project | Phased releases, cut list, buffer month |
| Hosting price or availability changes | Same Compose files everywhere; documented migration; pick a provider at the time you deploy |
| IDOR or permission bugs | Single permission service, deny by default, matrix tests |
| Legal exposure over performer consent, minors, and personal data | Per-participant consent records, decide policy with the Mandal early, privacy policy before launch |
| Data loss | Tested restore, separate backup bucket, versioned object storage |
| Scope creep | Section 3 out-of-scope list; every new feature needs a user story in section 5 |

**Verification tasks (all ⚠ items in one place)**
- Ticket Tailor: API coverage, webhook names, signature header and algorithm, comp ticket issuing, sandbox mode, widget or checkout ID type, fee exposure.
- Storage provider: EU data location, presigned upload and CORS behaviour, max object size, current pricing.
- Email provider: current free-tier limits and DNS setup.
- Server provider: availability and price of a 2 vCPU / 4 GB plan.
- Legal: consent and minors, retention periods, breach duties.

---

## 17. Appendix A: prototype findings

The "MMNL Platform: Prototype" artifact (single HTML file, about 180 KB, no backend, data in memory only) was inspected for this manual.

**What it contains**
- Public site with an event hero ("Ganeshotsav 2026", De Veste in Zoetermeer, Sat 29 Aug 2026, capacity 400: demo data), "Get tickets" buttons that would open Ticket Tailor checkout, and an upcoming-events list.
- Login modal with a demo account picker: Super Admin, Event Admin, one account per committee, and a plain Customer.
- Customer dashboard: **My tickets** (QR art, event, venue, date, ticket type, status badge, ticket ID, "Add to calendar") and **My feedback** (survey cards with four 1-5 ratings and an optional comment).
- Ops portal with a sidebar of modules per role: Overview (KPI cards, tickets-by-type bars, activity feed), Sponsorship, Cultural, Ticketing, Procurement, Promotion, Decoration, Surveys, Users.
- Seed data shows: ticket types General (€15), VIP (€35), Child (€5), with statuses issued, checked in, cancelled; sponsor tiers Gold, Silver, Bronze with pledged/paid and comp allotted/issued; performances with title, performer, type, duration, status and an audio player; procurement items with quantity, claimed, status and expense; promotion campaigns; a three-column decoration board; surveys with four rating categories and comments.

**Where the target design differs from the prototype**

| Topic | Prototype | Target |
|---|---|---|
| Roles | Flat global roles such as `CULTURAL_COMMITTEE`, `SPONSORSHIP_COMMITTEE`, `LOGISTICS_COMMITTEE`, `PROMOTION_COMMITTEE`, `DECORATION_COMMITTEE` | Event-scoped department roles with Member/Admin levels and a finance toggle |
| Event scoping | One hard-coded event | Many events, roles per event |
| Performance flow | Pending / Approved / Rejected with audio present from the start | Registration with participants and consent, then separate audio upload and approval |
| Who approves | Cultural committee, Event Admin, Super Admin | Cultural Member or higher (same idea, formalised) |
| Procurement claims | One `claimedBy` string per item | A claims table supporting partial claims from many people |
| Surveys | Shown on the dashboard; no one-per-buyer rule | Same dashboard placement, plus unique per buyer email per event |
| Comp passes | Simulated "Ticket Tailor emailed" | Depends on API spike; manual fallback |
| Persistence and security | None | Postgres, sessions, CSRF, audit log |
| Finance | Not modelled beyond KPI cards | Finance summary with flag-based visibility |

---

## 18. Appendix B: the original 12-module spec and what changed

The original plan split the work into 12 modules for different assignees. For a solo engineer these became epics (section 5) and steps (section 13).

| Original module | Fate |
|---|---|
| 1. Project master architecture | Kept and refined in sections 1, 7. The 5-level `SUPER_ADMIN > EVENT_ADMIN > COMMITTEE_ADMIN > COMMITTEE_MEMBER > CUSTOMER` hierarchy was replaced by event-scoped department roles (D4). |
| 2. Database schema and infrastructure | Schema expanded in section 8. The original said "see architecture docs for columns", which did not exist; the schema is now written out. S3/GCP bucket and `StorageService` kept. |
| 3. Authentication and RBAC | Kept. Google OAuth, auto-register as Customer. Evaluator logic extended with ordered levels, finance flag, and pending roles. |
| 4. Frontend base setup and routing | Kept. Decided on Vite + React Router (not Next), Shadcn, saffron/slate brand colours, `PublicLayout` and `DashboardLayout`, `<ProtectedRoute>`, "Switch to Admin Portal" toggle. |
| 5. Ticket Tailor sync and webhooks | **Reduced.** Event creation through the API dropped (events are created in Ticket Tailor and linked). Webhook ingestion kept, with idempotency, stored payloads, and reconciliation. Event and header names must be verified. |
| 6. Public views and customer dashboard | Kept. Embedded checkout widget replaced by a link to Ticket Tailor (D7). "My submissions" tab replaced by the performer flow. |
| 7. Cultural performances | **Reworked** into the two-stage flow with participants, consent, and separate audio approval. Audio player in review table kept. Drag-and-drop lineup replaced by move up/down controls. |
| 8. Sponsorship and VIP ticketing | Kept. Comp passes depend on the API spike. |
| 9. Procurement and finance | Kept. Added a claims table, concurrency protection, an expense approval workflow, and refund-free finance. |
| 10. Operations tasks and assets | Kept, with Kanban as the last item. Added promotion campaigns from the prototype. |
| 11. Automated feedback and surveys | **Changed.** Emailed single-use JWT links replaced by dashboard surveys for logged-in Google users. Uniqueness is per buyer email per event. |
| 12. Administering event committees | Kept, extended with Member/Admin levels, the finance toggle, and pending roles by email. |

**Problems found in the original plan (all addressed above)**
- Inconsistent role naming (`CULTURAL_ADMIN`, `PROCUREMENT_MEMBER`) versus the department and level model.
- String comparison of role levels.
- Missing columns (`sponsors.comp_tickets_issued`, `paid_amount`, procurement `actual_cost` and status, lineup order).
- Undefined expense approval step.
- No refund handling, GDPR, testing, deployment, backups, audit log, or bootstrap for the first Super Admin.
- Survey email per buyer but uniqueness per ticket.
- Unspecified choices (snake_case or camelCase, JWT or session cookie, Vite or Next, Shadcn or MUI).
- Race condition risk in procurement claims.
- Weak upload validation and proxying large files through the backend.
- Finance formula ignored fees.

---

## 19. Appendix C: glossary

| Term | Meaning |
|---|---|
| MMNL | Maharashtra Mandal Netherlands, the organisation. Not the "Netherlands Marathi Mandal". |
| Mandal | A Marathi community association. |
| Ganeshotsav | The Ganesh festival, MMNL's main event. |
| Dhol-tasha | A Maharashtrian drumming group; one of the two performance types. |
| Ticket Tailor | The ticketing and payments service MMNL uses. |
| Event Admin | The person running one event. |
| Department | A committee: Cultural, Sponsorship, Logistics, Promotion, Decoration. |
| Performer | A user with at least one approved performance for an event. |
| Comp pass | A complimentary ticket, for example for sponsors. |
| IDOR | Insecure direct object reference: accessing someone else's data by changing an ID. The main permission risk. |
| AVG / GDPR | Dutch / EU data protection law. |
| Flyway | Database migration tool. |
| MinIO | Local S3-compatible object store used in development. |
| Mailpit | Local email catcher used in development. |
| Presigned URL | A short-lived link that lets a browser upload or download directly from object storage. |
| CSRF | Cross-site request forgery; blocked with tokens on state-changing requests. |

