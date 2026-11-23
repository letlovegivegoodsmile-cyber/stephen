# Stephan Eicher — Management & Biographie

An independent, multilingual, dark-themed management and informational website for the Swiss artist Stephan Eicher. 

This project includes a public-facing biography and tour site, a simulated customer login dashboard (featuring a ticket countdown), and a separate secure admin panel to manage bookings.

## Features

- **French & English Support**: Toggle between FR and EN across the entire site.
- **Zero Image Dependencies**: The entire luxury gold/dark aesthetic is built using pure CSS gradients and geometric patterns. No external image files are required.
- **Customer Dashboard**: 
  - Secure demo login.
  - 7-second simulated "Flux Bank" buffering screen.
  - Displays the customer's next upcoming concert ticket, complete with a live days-remaining countdown and a generated barcode.
  - Lists all current and upcoming bookings.
- **Separate Admin Panel (`admin.html`)**:
  - Isolated login screen.
  - Dashboard statistics (Total, Confirmed, Pending).
  - Full booking management table to confirm statuses or delete bookings.
- **Data Persistence**: Bookings are synced in real-time between the customer dashboard and the admin panel using the browser's `localStorage`.

## Project Structure

The project is built with vanilla HTML, CSS, and JavaScript. All files live in the root directory for easy deployment:

```text
/
├── index.html       # Public site & Customer Dashboard
├── admin.html       # Separate Admin Login & Dashboard
├── style.css        # All styling (pure CSS, no images)
├── script.js        # Logic for both pages (shared)
└── README.md        # Project documentation
