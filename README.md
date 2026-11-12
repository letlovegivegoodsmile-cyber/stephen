# Stephan Eicher — Management & Booking Site

## Features
- French-first with EN/FR toggle.
- Flux Bank-style customer dashboard with 7-second buffering.
- Customer login (demo: `client` / `client123`) → dashboard with bookings.
- Admin login (demo: `admin` / `admin123`) → manage bookings (confirm/cancel/delete).
- Bookings persist in JavaScript memory (refresh resets data; for production, add a backend).

## How to run
1. Save the files in a folder named `stephan-eicher-site`.
2. Open `index.html` in any modern browser.
3. Use the language toggle (top right) to switch FR/EN.
4. Click **Connexion** → log in as `client` / `client123` to see the dashboard.
5. Click **Admin** → log in as `admin` / `admin123` to manage bookings.

## Notes
- The buffering screen counts down 7 seconds before revealing the dashboard.
- All data is client-side only. For real use, connect to a backend.
- Background images are loaded from Wikimedia (may require internet).
