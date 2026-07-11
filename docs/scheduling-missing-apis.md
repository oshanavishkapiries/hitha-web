# Missing APIs — Doctor Scheduling & Booking

Context: implementing "doctor publishes availability → admin operates on it → patient books" against
`docs/හිත-hitha-api-documentation.json`. The publish (doctor) and book (patient) sides are already fully
covered by the existing spec. What's missing is anything that lets a doctor read back their own
schedule, and anything that gives admin visibility or control over scheduling. This doc specifies the
endpoints needed to close those gaps, in the same conventions as the existing spec (`ApiResponse<T>`
envelope, PascalCase schema names).

## Already covered (no new work needed)

- `POST /doctors/slots` — doctor publishes weekly templates + one-off custom slots
- `GET/POST /doctors/blocked-dates`, `DELETE /doctors/blocked-dates/{id}` — doctor blocks time off
- `GET/POST /doctors/price-requests`, `GET/POST/POST /admin/price-requests...` — price change + admin approval, full loop
- `GET /patients/doctors/{id}` — patient sees a doctor's `availableSlots[]`
- `POST /patients/bookings`, `GET /patients/bookings`, `GET /patients/bookings/{id}/payment` — patient books + pays
- Session join, LiveKit tokens, ephemeral document sharing, identity toggle

## Missing — needed for doctor to see their own schedule

### 1. `GET /doctors/slots` — P0
List the authenticated doctor's own published slots, with booking status. Without this there is no way
for a doctor to see what they've published or what's already taken; the UI has nothing to render after
the initial `POST /doctors/slots` call.

**Query params:** `startDate` (date), `endDate` (date), `status` (`OPEN` | `BOOKED` | `BLOCKED`, optional)

**Response:** `ApiResponseListDoctorSlotResponse`
```
DoctorSlotResponse {
  id: uuid
  startTime: date-time
  endTime: date-time
  priceLkr: number
  status: "OPEN" | "BOOKED" | "BLOCKED"
  bookingId?: uuid        // present when status = BOOKED
  patientDisplayName?: string  // only if patient has shared identity; otherwise omit/anonymize
}
```

### 2. `DELETE /doctors/slots/{id}` — P1
Retract a single unbooked slot without needing a full blocked-date range for one slot. Should reject
(409/400) if the slot's status is already `BOOKED`.

### 3. `GET /doctors/bookings` — P0
The doctor's own appointment list — the core missing piece. Currently a doctor can only
`POST /doctors/sessions/{bookingId}/join`, which requires already knowing the `bookingId` (only
obtainable today via the real-time SSE notification stream, with no persistent fallback).

**Query params:** `status` (optional — see open question below), `startDate`, `endDate`, `page`, `size`

**Response:** `ApiResponseListBookingResponse` (reuse existing `BookingResponse`, or a doctor-scoped
variant that nests slot time + patient display info, respecting the identity-sharing toggle)

### 4. `GET /doctors/bookings/{id}` — P1
Single booking detail (patient contact info if identity shared, slot time, price) — useful before
joining a session.

## Missing — needed for admin operations on scheduling

Today admin has zero scheduling authority — no endpoint touches slots, blocked dates, or bookings for
any doctor. Everything below is new.

### 5. `GET /admin/bookings` — P0
Platform-wide booking list for support/ops (disputes, refund requests, no-show handling).

**Query params:** `doctorId` (optional), `status` (optional), `startDate`, `endDate`, `search` (patient
name/NIC), `page`, `size`

**Response:** `ApiResponseListBookingResponse`, admin-scoped (full detail regardless of the patient's
identity-sharing toggle, since admin needs it for support).

### 6. `GET /admin/bookings/{id}` — P2
Single booking detail for admin, for a specific support ticket.

### 7. `POST /admin/bookings/{id}/cancel` — P1
Admin-initiated cancellation (refund/dispute/fraud handling). Mirrors the reject pattern already used
for blogs (`BlogRejectRequest`) and price requests (`PriceRequestRejectRequest`).

**Request:** `{ reason: string }` (required)

Should trigger a refund via the PayHere integration and release the slot (back to `OPEN`, or whatever
the backend's cancellation semantics are — see open question below).

### 8. `GET /admin/doctors/{id}/slots` — P1
Same shape as #1, but for any doctor — needed for support tickets like "why can't I book with Dr. X."

**Query params:** `startDate`, `endDate`, `status`

### 9. `POST /admin/doctors/{id}/slots/{slotId}/block` — P2 (optional)
Admin force-blocks a specific slot on a doctor's calendar without waiting for the doctor to self-manage
(e.g. handling a complaint). Lowest priority — only add if there's a concrete support workflow that
needs it.

## Open questions for whoever implements these

- **Booking status enum**: `BookingResponse.status` is typed as a bare `string` in the current spec with
  no documented enum values (unlike e.g. `BlogResponse.status`, which lists all five values explicitly).
  The `#3`/`#5` query-param filters above assume something like `LOCKED | CONFIRMED | COMPLETED |
  CANCELLED` based on the `lockedUntil` checkout-hold field, but the actual values need to be confirmed
  and then documented in the spec the same way blog/doctor statuses are.
- **Cancellation semantics**: does cancelling a booking (#7) release the slot back to `OPEN` for
  rebooking, or does it get retired? Affects both the admin UI and the doctor's `GET /doctors/slots`
  status transitions.
- **Two pre-existing frontend/backend mismatches**, unrelated to the above but worth fixing while this
  area gets touched: the current frontend's `AvailabilityConfigRequest` (`slots[]` +
  `timeSlotDurationMinutes`) doesn't match the documented `{ templates[], customSlots[] }` shape, and its
  `BlockedDateRequest` (`blockedDate: string`) doesn't match the documented `{ startTime, endTime,
  reason }` shape. These are already-defined backend contracts the frontend just isn't calling
  correctly — not new API work, just a frontend fix once this area is implemented.
