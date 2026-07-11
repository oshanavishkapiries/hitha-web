# Handover Specification: Doctor Scheduling & Bookings Integration

This specification details the frontend integration contracts for the newly added and fixed backend endpoints in the **Hitha** doctor scheduling and booking module.

All backend endpoints are verified, compiled, and smoke-tested against a live PostgreSQL database on port `8081` with base path `/api/v1`.

---

## 1. Required Frontend-Side Contract Fixes

The frontend team must update these interfaces inside `src/lib/service/functions/doctor.service.ts` to prevent silent data loss or hard `400 Bad Request` exceptions.

### Fix 1: Availability Configuration (`POST /doctors/slots`)
* **Endpoint**: `POST /api/v1/doctors/slots`
* **What is broken**: Frontend sends `slots` and `timeSlotDurationMinutes`. The backend expects `templates` and `customSlots`. Because of the mismatch, templates default to `[]` and zero slots are generated.
* **Handover Contract**:
```typescript
export interface TemplateRequest {
  dayOfWeek: number;    // 1 (Monday) to 7 (Sunday)
  startTime: string;    // "HH:MM" format (e.g., "09:00")
  endTime: string;      // "HH:MM" format (e.g., "17:00")
}

export interface CustomSlotRequest {
  startTime: string;    // ISO-8601 UTC Instant (e.g., "2026-07-15T09:00:00Z")
  endTime: string;      // ISO-8601 UTC Instant
}

export interface AvailabilityConfigRequest {
  templates: TemplateRequest[];
  customSlots: CustomSlotRequest[]; // Pass [] if none
}
```
* **Note**: `timeSlotDurationMinutes` has been removed from the client request payload. Slot duration is a server-side configuration (`booking.slot-default-duration-minutes` in `application.yml`).

---

### Fix 2: Block Date Range (`POST /doctors/blocked-dates`)
* **Endpoint**: `POST /api/v1/doctors/blocked-dates`
* **What is broken**: Frontend sends `{ blockedDate: "YYYY-MM-DD" }`. The backend requires `@NotNull` `startTime` and `endTime` instants, causing a `400 Bad Request` validation error.
* **Handover Contract**:
```typescript
export interface BlockedDateRequest {
  startTime: string;    // ISO-8601 UTC Instant (e.g., "2026-07-15T00:00:00Z")
  endTime: string;      // ISO-8601 UTC Instant (e.g., "2026-07-15T23:59:59.999Z")
  reason?: string;
}

export interface BlockedDateResponse {
  id: string;
  startTime: string;    // ISO-8601 UTC Instant
  endTime: string;      // ISO-8601 UTC Instant
  reason?: string;
}
```

---

## 2. API Enum Specifications
* **`BookingStatus`**: `PENDING_PAYMENT` | `CONFIRMED` | `ACTIVE` | `COMPLETED` | `NO_SHOW` | `CANCELLED`
* **`SlotStatus`**: `AVAILABLE` | `RESERVED` | `BOOKED` | `BLOCKED`

---

## 3. New Endpoints Specification

### A. Doctor Endpoints (`Role: DOCTOR`)

#### 1. Retrieve Slots (`GET /doctors/slots`)
* **Path**: `/api/v1/doctors/slots`
* **Query Parameters**:
  - `startDate` (Required, `YYYY-MM-DD` e.g., `2026-07-01`)
  - `endDate` (Required, `YYYY-MM-DD` e.g., `2026-07-31`)
  - `status` (Optional, `SlotStatus` filter)
* **Headers**: `Authorization: Bearer <DoctorToken>`
* **Response (Tested Shape)**:
```json
{
  "success": true,
  "status": 200,
  "message": "Slots retrieved successfully.",
  "data": [
    {
      "id": "c6ae6624-b14c-4778-be79-4cac5053ad8b",
      "startTime": "2026-07-04T06:00:22.017511Z",
      "endTime": "2026-07-04T06:10:22.017511Z",
      "priceLkr": 2500.00,
      "status": "BOOKED",
      "bookingId": "b6772be2-f340-4f4c-be5a-9ed81a59d869",
      "patientDisplayName": null // Masked to null because patient did not share identity
    }
  ]
}
```

#### 2. Delete Slot (`DELETE /doctors/slots/{id}`)
* **Path**: `/api/v1/doctors/slots/{id}`
* **Headers**: `Authorization: Bearer <DoctorToken>`
* **Response (Success)**:
```json
{
  "success": true,
  "status": 200,
  "message": "Slot deleted successfully.",
  "data": null
}
```
* **Response (Failure - Booked slot)**:
```json
{
  "success": false,
  "status": 409,
  "message": "Cannot delete a slot that is already booked",
  "data": null
}
```

#### 3. List Doctor's Bookings (`GET /doctors/bookings`)
* **Path**: `/api/v1/doctors/bookings`
* **Query Parameters**:
  - `status` (Optional, `BookingStatus`)
  - `startDate` (Optional, `YYYY-MM-DD`)
  - `endDate` (Optional, `YYYY-MM-DD`)
  - `page` (Optional, default `0`)
  - `size` (Optional, default `20`)
* **Headers**: `Authorization: Bearer <DoctorToken>`
* **Response (Tested Shape)**:
```json
{
  "success": true,
  "status": 200,
  "message": "Bookings retrieved successfully.",
  "data": {
    "content": [
      {
        "bookingId": "b6772be2-f340-4f4c-be5a-9ed81a59d869",
        "status": "COMPLETED",
        "bookedAt": "2026-07-04T06:00:24.314662Z",
        "totalPriceLkr": null,
        "extraTimeBooked": false,
        "appointmentForSomeoneElse": false,
        "slots": [
          {
            "id": "c6ae6624-b14c-4778-be79-4cac5053ad8b",
            "startTime": "2026-07-04T06:00:22.017511Z",
            "endTime": "2026-07-04T06:10:22.017511Z",
            "priceLkr": 2500.00,
            "status": "BOOKED",
            "bookingId": "b6772be2-f340-4f4c-be5a-9ed81a59d869",
            "patientDisplayName": null
          }
        ],
        "patientName": null,      // Masked because shareIdentity = false
        "patientNic": null,       // Masked because shareIdentity = false
        "patientEmail": null,     // Masked because shareIdentity = false
        "sessionStartedAt": "2026-07-04T06:00:32.173595Z",
        "sessionEndedAt": "2026-07-04T06:15:27.637811Z"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "sort": { "empty": false, "sorted": true, "unsorted": false }
    },
    "totalPages": 1,
    "totalElements": 2,
    "last": true,
    "size": 20,
    "number": 0
  }
}
```

#### 4. Get Booking Detail (`GET /doctors/bookings/{id}`)
* **Path**: `/api/v1/doctors/bookings/{id}`
* **Headers**: `Authorization: Bearer <DoctorToken>`
* **Response (Tested Shape)**:
```json
{
  "success": true,
  "status": 200,
  "message": "Booking details retrieved successfully.",
  "data": {
    "bookingId": "b6772be2-f340-4f4c-be5a-9ed81a59d869",
    "status": "COMPLETED",
    "bookedAt": "2026-07-04T06:00:24.314662Z",
    "totalPriceLkr": null,
    "extraTimeBooked": false,
    "appointmentForSomeoneElse": false,
    "slots": [
      {
        "id": "c6ae6624-b14c-4778-be79-4cac5053ad8b",
        "startTime": "2026-07-04T06:00:22.017511Z",
        "endTime": "2026-07-04T06:10:22.017511Z",
        "priceLkr": 2500.00,
        "status": "BOOKED",
        "bookingId": "b6772be2-f340-4f4c-be5a-9ed81a59d869",
        "patientDisplayName": null
      }
    ],
    "patientName": null,
    "patientNic": null,
    "patientEmail": null,
    "sessionStartedAt": "2026-07-04T06:00:32.173595Z",
    "sessionEndedAt": "2026-07-04T06:15:27.637811Z"
  }
}
```

---

### B. Admin Endpoints (`Roles: ADMIN | SUPER_ADMIN`)

#### 5. List Platform Bookings (`GET /admin/bookings`)
* **Path**: `/api/v1/admin/bookings`
* **Query Parameters**:
  - `doctorId` (Optional, UUID)
  - `status` (Optional, `BookingStatus`)
  - `startDate` (Optional, ISO string e.g., `2026-07-11T00:00:00Z`)
  - `endDate` (Optional, ISO string)
  - `search` (Optional, patient name or NIC search query)
  - `page` (Optional, default `0`)
  - `size` (Optional, default `20`)
* **Headers**: `Authorization: Bearer <AdminToken>`
* **Response (Tested Shape)**:
```json
{
  "success": true,
  "status": 200,
  "message": "Platform bookings retrieved successfully.",
  "data": {
    "content": [
      {
        "bookingId": "b6772be2-f340-4f4c-be5a-9ed81a59d869",
        "slotIds": ["c6ae6624-b14c-4778-be79-4cac5053ad8b"],
        "status": "COMPLETED",
        "name": "Chathura De Silva",       // Admin always sees full details
        "nic": "901234567V",
        "email": null,
        "appointmentForSomeoneElse": false,
        "totalPriceLkr": null,
        "extraTimeBooked": false,
        "doctorId": "e8b1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c4d",
        "doctorFirstName": "Bhanuka",
        "doctorLastName": "Viraj",
        "bookedAt": "2026-07-04T06:00:24.314662Z",
        "sessionStartedAt": "2026-07-04T06:00:32.173595Z",
        "sessionEndedAt": "2026-07-04T06:15:27.637811Z",
        "cancellationReason": null
      }
    ]
  }
}
```

#### 6. Get Booking Detail (`GET /admin/bookings/{id}`)
* **Path**: `/api/v1/admin/bookings/{id}`
* **Headers**: `Authorization: Bearer <AdminToken>`
* **Response**: `ApiResponse<BookingResponse>` (Contains the same schema as booking items inside the content array of endpoint 5).

#### 7. Cancel Booking (`POST /admin/bookings/{id}/cancel`)
* **Path**: `/api/v1/admin/bookings/{id}/cancel`
* **Headers**: `Authorization: Bearer <AdminToken>`
* **Request Body**:
```json
{
  "reason": "Patient requested cancellation due to personal reasons"
}
```
* **Response**:
```json
{
  "success": true,
  "status": 200,
  "message": "Booking cancelled successfully.",
  "data": null
}
```
* **Note**: This frees all associated doctor actual slots and blocked overflow-buffer slots, changing their status back to `AVAILABLE`.

#### 8. Retrieve Doctor Slots (`GET /admin/doctors/{id}/slots`)
* **Path**: `/api/v1/admin/doctors/{id}/slots`
* **Query Parameters**:
  - `startDate` (Required, `YYYY-MM-DD`)
  - `endDate` (Required, `YYYY-MM-DD`)
  - `status` (Optional, `SlotStatus`)
* **Headers**: `Authorization: Bearer <AdminToken>`
* **Response (Tested Shape)**:
```json
{
  "success": true,
  "status": 200,
  "message": "Doctor slots retrieved successfully.",
  "data": [
    {
      "id": "c6ae6624-b14c-4778-be79-4cac5053ad8b",
      "startTime": "2026-07-04T06:00:22.017511Z",
      "endTime": "2026-07-04T06:10:22.017511Z",
      "priceLkr": 2500.00,
      "status": "BOOKED",
      "bookingId": "b6772be2-f340-4f4c-be5a-9ed81a59d869",
      "patientDisplayName": "Chathura De Silva" // Admin bypasses privacy toggle mapping
    }
  ]
}
```

#### 9. Force-Block Slot (`POST /admin/doctors/{id}/slots/{slotId}/block`)
* **Path**: `/api/v1/admin/doctors/{id}/slots/{slotId}/block`
* **Headers**: `Authorization: Bearer <AdminToken>`
* **Response**:
```json
{
  "success": true,
  "status": 200,
  "message": "Slot blocked successfully.",
  "data": null
}
```
* **Note**: Changes slot status from `AVAILABLE` to `BLOCKED` directly. Cannot block already `BOOKED` slots.
