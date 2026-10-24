# MMNL frontend: backend API contract

Everything the React app calls. Auth is the existing Spring session cookie. The frontend never sends tokens.

## Conventions

- **Base paths:** `/api/me` (existing) and `/api/v1/...` (new). Same origin as the SPA (Vite proxies in dev).
- **CSRF:** the app reads the `XSRF-TOKEN` cookie and sends `X-XSRF-TOKEN` on every non-GET request. In Spring: `CookieCsrfTokenRepository.withHttpOnlyFalse()`.
- **JSON everywhere.** Money is integer cents (`...Cents`). Timestamps are ISO-8601 instants (UTC). Date-only fields are `YYYY-MM-DD`.
- **Status enums** (UPPER_SNAKE): the UI formats them for display.
- **Errors:** return `{ "message": string, "safe": boolean }`.
  - 4xx: `message` is shown inline next to the form or button (use 400/409/422 for validation).
  - 5xx or network failure: the whole app shows the error page. If `safe: true`, `message` is displayed. Otherwise the page says "contact the owner at <email>". Never put stack traces or SQL in `message`.
  - A 200 response that is not JSON is treated as a server error.
- **Authorization** is enforced here, not in the UI. The UI only hides things. Return 403 for forbidden and 404 where existence should not leak.
- **Presigned URLs** (`audioUrl`, `receiptUrl`, `downloadUrl`, `qrUrl`, `bannerUrl`) must be short-lived and returned fresh in each response.

## Auth

| Method | Path | Notes |
|---|---|---|
| GET | `/oauth2/authorization/google` | Browser redirect. Existing. |
| POST | `/logout` | Spring default. The app then navigates to `/`. Change `LOGOUT_URL` in `src/config.js` if different. |
| GET | `/api/me` | Existing. 401 when signed out. Needs more fields (below). |

`/api/me` response:
```json
{
  "id": "…", "email": "a@b.com", "firstName": "Asha", "fullName": "Asha Patil",
  "isSuperAdmin": false,
  "roles": [
    { "eventId": "…", "eventTitle": "…", "department": null, "level": "ADMIN", "financeAccess": "WHOLE_EVENT" },
    { "eventId": "…", "department": "CULTURAL", "level": "MEMBER", "financeAccess": "NONE" }
  ]
}
```
- `department: null` means **Event Admin** for that event.
- Departments: `CULTURAL | SPONSORSHIP | LOGISTICS | PROMOTION | DECORATION`. Level: `MEMBER | ADMIN`. Finance: `NONE | OWN_DEPARTMENT | WHOLE_EVENT`.
- If `roles`/`isSuperAdmin` are missing, the app treats the person as a plain customer.

## Presigned uploads (shared)

| Method | Path | Body → Response |
|---|---|---|
| POST | `/api/v1/events/{eventId}/uploads/presign` | `{ purpose: "AUDIO"\|"RECEIPT"\|"ASSET"\|"BANNER", filename, mime, sizeBytes }` → `{ uploadUrl, storageKey, headers? }` |

The browser then does `PUT uploadUrl` with the file (plus `headers` if given), and sends `storageKey` to the endpoint that attaches it. Check the purpose against the caller's permissions (for example `AUDIO` only for a performer of that event).

## Public (no sign-in)

| Method | Path | Response |
|---|---|---|
| GET | `/api/v1/events?scope=upcoming\|past` | `[{ id, title, startsAt, endsAt, venue, bannerUrl, ticketTailorUrl, registrationDeadline, registrationOpen }]` (published only) |
| GET | `/api/v1/events/{eventId}` | list fields plus `description, refundable, audioDeadline, sponsors: [{ id, company, tier, logoUrl }]` (only sponsors with `isPublic`) |

## Signed-in customer

| Method | Path | Body → Response |
|---|---|---|
| GET | `/api/v1/me/tickets` | `[{ id, eventId, eventTitle, venue, startsAt, endsAt, ticketType, status, qrUrl, barcode, attendeeName, isComplimentary }]` (matched by email). `status`: `ISSUED\|CHECKED_IN\|CANCELLED` |
| GET | `/api/v1/me/surveys` | `[{ id, eventId, eventTitle, status, submitted }]` (only open surveys for people who checked in) |
| POST | `/api/v1/surveys/{surveyId}/responses` | `{ overall, food, cultural, venue (1-5), comment }` → 409 if already submitted |
| GET | `/api/v1/me/performances` | `[{ id, eventId, eventTitle, groupName, type, status, statusReason }]`. `status`: `DRAFT\|REGISTERED\|APPROVED\|REJECTED\|WITHDRAWN` |
| POST | `/api/v1/events/{eventId}/performances` | create (below) → `{ id }`. 409 if registration closed |
| GET | `/api/v1/performances/{id}` | `{ id, eventId, eventTitle, groupName, type, durationMinutes, description, status, statusReason, participants: [{ id, fullName, isMinor, guardianName, guardianEmail, consentGiven }] }` (owner only) |
| PUT | `/api/v1/performances/{id}` | update (same body); only while `DRAFT` or `REJECTED` |
| POST | `/api/v1/performances/{id}/withdraw` | none |
| POST | `/api/v1/performances/{id}/participants/{participantId}/consent-withdrawal` | none. Flags the act for the Cultural Admin |
| GET | `/api/v1/events/{eventId}/performer-area` | `{ event: { id, title, audioDeadline }, announcements: [{ id, subject, body, sentAt }], performances: [{ id, groupName, status, consentComplete, audio: { status: "UPLOADED\|APPROVED\|CHANGES_REQUESTED", filename, url, reviewerNote } }] }` (approved acts of this user) |
| POST | `/api/v1/performances/{id}/audio` | `{ storageKey, filename, mime, sizeBytes }` (replace allowed until approved; rejected after the deadline) |
| GET | `/api/v1/me/data-export` | file download (JSON) |
| DELETE | `/api/v1/me` | 204. The app then reloads at `/` |

Create/update body: `{ groupName, type, durationMinutes, description, participants: [{ id?, fullName, isMinor, guardianName, guardianEmail, consentGiven }], consentAttested: boolean, submit: boolean }`. `submit: false` saves a `DRAFT`. `submit: true` moves to `REGISTERED` and emails confirmation. Store consent as `lead_attested` with the actor and timestamp.

## Admin portal: platform and events

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/admin/events` | Events the caller can administer: `[{ id, title, status, startsAt, venue }]` (`status`: `DRAFT\|PUBLISHED\|COMPLETED`) |
| POST | `/api/v1/admin/events` | Super Admin. Body: event fields → `{ id }` |
| GET | `/api/v1/admin/events/{eventId}` | event fields plus `status`, `bannerUrl`, `ticketTailorRef`, `capacity`, `updatedAt` |
| PUT | `/api/v1/admin/events/{eventId}` | `{ title, description, venue, startsAt, endsAt, ticketTailorUrl, ticketTailorRef, capacity, refundable, bannerKey?, registrationDeadline, audioDeadline }` |
| POST | `/api/v1/admin/events/{eventId}/status` | `{ status: "DRAFT"\|"PUBLISHED"\|"COMPLETED" }` |
| GET | `/api/v1/admin/events/{eventId}/overview` | `{ ticketsSold, checkedIn, capacity, ticketRevenueCents, sponsorPaidCents, performances: { registered, approved, audioApproved }, ticketsByType: [{ type, count }], activity: [{ at, actor, action }] }`. Omit fields the caller may not see (for example money for non-finance roles) |
| GET | `/api/v1/admin/platform/super-admins` | Super Admin. `[{ userId, name, email }]` |
| POST | `/api/v1/admin/platform/super-admins` | `{ email }` |
| DELETE | `/api/v1/admin/platform/super-admins/{userId}` | |

## Ticketing (Event Admin)

| Method | Path | Response |
|---|---|---|
| GET | `/api/v1/admin/events/{eventId}/ticket-stats` | `{ sold, checkedIn, cancelled, revenueCents, byType: [{ type, sold, checkedIn, revenueCents }] }` |
| GET | `/api/v1/admin/events/{eventId}/attendees?q=&page=` | `{ items: [{ id, name, email, ticketType, status, isComplimentary, barcode }], total }` (25 per page) |

## Cultural

| Method | Path | Body → Response |
|---|---|---|
| GET | `/api/v1/admin/events/{eventId}/performances` | all acts: `[{ id, groupName, type, durationMinutes, description, status, submitterName, submitterEmail, consentWithdrawn, participants: [...], audio: { status, filename, url, reviewerNote } }]` |
| POST | `/api/v1/admin/performances/{id}/decision` | `{ decision: "APPROVE"\|"REJECT", reason }` (reason required for reject; emails the registrant) |
| POST | `/api/v1/admin/performances/{id}/audio-decision` | `{ decision: "APPROVE"\|"REQUEST_CHANGES", reason }` |
| GET | `/api/v1/admin/events/{eventId}/lineup` | `{ locked, items: [{ id, groupName, durationMinutes, audioApproved, consentComplete }] }` in running order |
| PUT | `/api/v1/admin/events/{eventId}/lineup` | `{ order: [performanceId] }` (Cultural Admin; rejected when locked) |
| POST | `/api/v1/admin/events/{eventId}/lineup/lock` | `{ locked: boolean, overrideReason }` (override needed to lock with missing audio or consent; log it) |
| GET | `/api/v1/admin/events/{eventId}/lineup/export?format=csv\|pdf` | file download |
| GET | `/api/v1/admin/events/{eventId}/announcements` | `[{ id, subject, body, sentAt, recipientCount }]` |
| POST | `/api/v1/admin/events/{eventId}/announcements` | `{ subject, body }` (Cultural Admin; emails approved performers) |

## Sponsorship

| Method | Path | Body → Response |
|---|---|---|
| GET | `/api/v1/admin/events/{eventId}/sponsors` | `[{ id, company, tier, status, contactName, contactEmail, pledgedCents, paidCents, isPublic, compAllotted, compIssued, payments: [{ id, amountCents, receivedOn, note }], compPasses: [{ id, recipientName, ticketType, status }] }]` |
| POST | `/api/v1/admin/events/{eventId}/sponsors` | `{ company, tier, status, contactName, contactEmail, pledgedCents, isPublic }` |
| PUT | `/api/v1/admin/sponsors/{sponsorId}` | same body |
| POST | `/api/v1/admin/sponsors/{sponsorId}/payments` | `{ amountCents, receivedOn, note }` (Sponsorship Admin) |
| POST | `/api/v1/admin/sponsors/{sponsorId}/comp-passes` | `{ recipientName, recipientEmail, ticketType }` (Sponsorship Admin) |
| POST | `/api/v1/admin/comp-passes/{passId}/void` | |

Tiers: `GOLD|SILVER|BRONZE`. Status: `PROSPECT|COMMITTED|PAID`.

## Procurement (Logistics)

| Method | Path | Body → Response |
|---|---|---|
| GET | `/api/v1/admin/events/{eventId}/procurement-items` | `[{ id, name, requiredQuantity, claimedQuantity, estimatedCostCents, deadline, notes, claims: [{ id, userName, mine, quantity, expense: { id, amountCents, status, reason } \| null }] }]` |
| POST | `/api/v1/admin/events/{eventId}/procurement-items` | `{ name, requiredQuantity, estimatedCostCents, deadline, notes }` (Logistics Admin) |
| PUT | `/api/v1/admin/procurement-items/{itemId}` | same body |
| POST | `/api/v1/admin/procurement-items/{itemId}/claims` | `{ quantity }` (409 if over-claimed) |
| DELETE | `/api/v1/admin/procurement-claims/{claimId}` | own claim, only before an expense exists |
| POST | `/api/v1/admin/procurement-claims/{claimId}/expense` | `{ amountCents, receiptKey? }` (`receiptKey` from presign `RECEIPT`; allowed again after a rejection) |
| GET | `/api/v1/admin/events/{eventId}/expenses` | Logistics Admin. `[{ id, itemName, claimant, amountCents, receiptUrl, status, reason }]`. `status`: `SUBMITTED\|APPROVED\|REJECTED\|REIMBURSED` |
| POST | `/api/v1/admin/expenses/{expenseId}/decision` | `{ decision: "APPROVE"\|"REJECT", reason }` |
| GET | `/api/v1/admin/events/{eventId}/reimbursements` | Event Admin. `[{ userId, name, totalCents, expenses: [{ id, itemName, amountCents, status }] }]` |
| POST | `/api/v1/admin/expenses/{expenseId}/reimburse` | |

## Finance

| Method | Path | Response |
|---|---|---|
| GET | `/api/v1/admin/events/{eventId}/finance?scope=event\|department` | `{ ticketRevenueCents?, sponsorIncomeCents?, approvedExpensesCents, netCents?, byDepartment: [{ department, expensesCents, pendingCents }] }`. Omit event-wide fields when the caller only has `OWN_DEPARTMENT` |
| GET | `/api/v1/admin/events/{eventId}/finance/export?scope=` | CSV download |

## Promotion, tasks, assets

| Method | Path | Body → Response |
|---|---|---|
| GET | `/api/v1/admin/events/{eventId}/campaigns` | `[{ id, name, platform, status, startsOn, endsOn, notes }]` (`SCHEDULED\|LIVE\|DONE`) |
| POST | `/api/v1/admin/events/{eventId}/campaigns` | same fields |
| PUT | `/api/v1/admin/campaigns/{id}` | same fields |
| GET | `/api/v1/admin/events/{eventId}/tasks?department=` | `[{ id, title, description, status, assigneeName, dueDate, canUpdateStatus }]` (`TODO\|IN_PROGRESS\|DONE`) |
| POST | `/api/v1/admin/events/{eventId}/tasks` | `{ title, description, department, assigneeId, dueDate }` (department admin) |
| PUT | `/api/v1/admin/tasks/{taskId}/status` | `{ status }` (assignee or department admin) |
| GET | `/api/v1/admin/events/{eventId}/assignees?department=` | `[{ userId, name, email }]` for the assignee dropdown |
| GET | `/api/v1/me/tasks` | `[{ id, eventId, eventTitle, department, title, status, dueDate }]` |
| GET | `/api/v1/admin/events/{eventId}/assets?category=` | `[{ id, filename, category, department, uploadedBy, uploadedAt, downloadUrl, canDelete }]` |
| POST | `/api/v1/admin/events/{eventId}/assets` | `{ storageKey, filename, category, department }` (categories `FLYER\|LOGO\|FLOOR_PLAN\|OTHER`) |
| DELETE | `/api/v1/admin/assets/{assetId}` | |

## Surveys, team, audit (Event Admin)

| Method | Path | Body → Response |
|---|---|---|
| GET | `/api/v1/admin/events/{eventId}/survey-results` | `{ status: "DRAFT\|OPEN\|CLOSED", responseCount, averages: { overall, food, cultural, venue }, comments: [string] }` (anonymous) |
| POST | `/api/v1/admin/events/{eventId}/survey/status` | `{ status: "OPEN"\|"CLOSED" }` |
| GET | `/api/v1/admin/events/{eventId}/roles` | `[{ id, email, name, department, level, financeAccess, status }]` (`status: ACTIVE\|PENDING`) |
| POST | `/api/v1/admin/events/{eventId}/roles` | `{ email, department, level, financeAccess }` (`department: null` = Event Admin). Preassign by email; it activates on first sign-in |
| PUT | `/api/v1/admin/roles/{roleId}` | `{ department, level, financeAccess }` |
| DELETE | `/api/v1/admin/roles/{roleId}` | revoke. Reject removing the last Event Admin with 409 and a clear message |
| GET | `/api/v1/admin/events/{eventId}/audit-log?page=` | `{ items: [{ id, at, actor, action, entityType, entityId }], total }` |

## Not covered by this UI (add later if wanted)

- Deadline exceptions per registrant (story 4.2). Deadlines are event-wide only for now.
- Task file attachments.
- Ticket Tailor webhooks, email sending and the daily sync are pure backend work.
