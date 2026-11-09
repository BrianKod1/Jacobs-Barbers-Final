# Jacobs Barbers — Independent Booking System

This is a **server-backed booking system** for a Vercel deployment. GitHub Pages can continue hosting the original static site but cannot process bookings: **do not launch the booking page there**.

## Features
- 30-minute reservations on the published shop schedule
- live availability from PostgreSQL
- unique occupied slot index protecting against simultaneous double-booking
- confirmation reference after a committed database insert
- private admin dashboard for appointments, cancellation and blocked slots
- password verification with scrypt + signed HttpOnly SameSite=Strict cookie
- login throttling, basic reservation quotas and honeypot field

## Setup
1. Use a separate development/preview Vercel project built from this repository branch; do not repoint lucy's domain.
2. Provision a managed PostgreSQL database (e.g. Neon) and run db/schema.sql.
3. Add DATABASE_URL, ADMIN_PASSWORD_HASH, ADMIN_SESSION_SECRET to Vercel environment variables (not Git).
4. Generate an admin hash locally using: `node scripts/create-admin-hash.mjs`; enter the password interactively, don't share it in chat.
5. Test public booking on Vercel /booking.html, check its reservation in /admin.html, test conflict and cancellation.
6. Confirm schedule, service names, prices, appointment length and data-handling agreement with Lucy before launching.

IMPORTANT: The booking is confirmed in the database and displayed with a reference. Optional Resend notifications send to the customer and Lucy only when all three email settings are configured. Transactional email support is implemented through optional Resend settings. Configure and test a verified domain before enabling email delivery; customer self-service cancellation is not yet implemented. Protect the client data by granting dashboard access to Lucy only. Consider a retention and privacy notice before public release.
