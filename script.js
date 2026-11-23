/* ============================================================
   SHARED BOOKING STORAGE (localStorage)
   ============================================================ */
const STORAGE_KEY = 'stephan_eicher_bookings';
const ADMIN_SESSION_KEY = 'se_admin_logged_in';

const DEFAULT_BOOKINGS = [
  { id: 1, client: 'Client', date: '2026-12-15', venue: 'Olympia, Paris', status: 'confirmed' },
  { id: 2, client: 'Client', date: '2027-02-20', venue: 'Zénith, Lille', status: 'pending' },
  { id: 3, client: 'Client', date: '2027-03-10', venue: 'Halle Tony Garnier, Lyon', status: 'confirmed' },
  { id: 4, client: 'Client', date: '2027-04-05', venue: 'Le Dôme, Marseille', status: 'confirmed' },
  { id: 5, client: 'Client', date: '2027-05-12', venue: 'Casino de Paris', status: 'pending' },
];

function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BOOKINGS));
      return DEFAULT_BOOKINGS.slice();
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_BOOKINGS.slice();
  } catch (e) {
    return DEFAULT_BOOKINGS.slice();
  }
}
function saveBookings(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
function nextBookingId() {
  const list = loadBookings();
  return list.length ? Math.max(...list.map(b => b.id)) + 1 : 1;
}

/* ============================================================
   DETECT PAGE
   ============================================================ */
const isAdminPage = document.body.classList.contains('admin-page');

/* ============================================================
   LANGUAGE (index only)
   ============================================================ */
let currentLang = 'fr';

function toggleLanguage() {
  currentLang = currentLang === 'fr' ? 'en' : 'fr';
  const frEl = document.getElementById('langFR');
  const enEl = document.getElementById('langEN');
  if (frEl) {
    frEl.classList.toggle('active', currentLang === 'fr');
    frEl.classList.toggle('inactive', currentLang === 'en');
  }
  if (enEl) {
    enEl.classList.toggle('active', currentLang === 'en');
    enEl.classList.toggle('inactive', currentLang === 'fr');
  }
  document.querySelectorAll('[data-fr]').forEach(el => {
    const fr = el.getAttribute('data-fr'), en = el.getAttribute('data-en');
    if (fr && en) el.textContent = currentLang === 'fr' ? fr : en;
  });
  const btn = document.getElementById('loginBtn');
  if (btn) btn.textContent = currentLang === 'fr' ? 'Connexion' : 'Log in';
  if (document.getElementById('dashboardPanel')?.classList.contains('active')) renderCustomerDashboard();
  renderTourDates();
}

/* ============================================================
   MODAL UTILS (index only)
   ============================================================ */
function openLogin() { document.getElementById('loginModal')?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }
function openBookingForm() { document.getElementById('bookingModal')?.classList.add('active'); }

/* ============================================================
   CUSTOMER LOGIN + BUFFER + DASHBOARD (index only)
   ============================================================ */
function handleLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  if (user === 'client' && pass === 'client123') {
    closeModal('loginModal');
    startCustomerBuffer();
  } else {
    alert('Invalid credentials. Use client / client123');
  }
}

let bufferInterval = null;
function startCustomerBuffer() {
  const overlay = document.getElementById('dashboardOverlay');
  const bufferScreen = document.getElementById('bufferScreen');
  const dashboardPanel = document.getElementById('dashboardPanel');
  if (!overlay) return;
  overlay.classList.add('active');
  bufferScreen.classList.add('active');
  dashboardPanel.classList.remove('active');

  let count = 7;
  const countdownEl = document.getElementById('bufferCountdown');
  const fillEl = document.getElementById('bufferFill');
  countdownEl.textContent = count;
  fillEl.style.width = '0%';

  if (bufferInterval) clearInterval(bufferInterval);
  bufferInterval = setInterval(() => {
    count--;
    countdownEl.textContent = count;
    fillEl.style.width = ((7 - count) / 7 * 100) + '%';
    if (count <= 0) {
      clearInterval(bufferInterval); bufferInterval = null;
      bufferScreen.classList.remove('active');
      dashboardPanel.classList.add('active');
      renderCustomerDashboard();
    }
  }, 1000);
}

function closeDashboard() {
  document.getElementById('dashboardOverlay')?.classList.remove('active');
  document.getElementById('bufferScreen')?.classList.remove('active');
  document.getElementById('dashboardPanel')?.classList.remove('active');
  if (bufferInterval) { clearInterval(bufferInterval); bufferInterval = null; }
}

function renderCustomerDashboard() {
  if (!document.getElementById('dashboardPanel')) return;

  document.getElementById('dashWelcome').textContent = currentLang === 'fr' ? 'Bienvenue' : 'Welcome back';
  document.getElementById('dashUserName').textContent = currentLang === 'fr' ? 'Bonjour, Client' : 'Hello, Client';

  const bookings = loadBookings();
  const ticketView = document.getElementById('customerTicketView');
  const now = new Date();
  const upcoming = bookings
    .filter(b => new Date(b.date) > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextShow = upcoming[0];

  if (nextShow) {
    const showDate = new Date(nextShow.date);
    const diffDays = Math.ceil((showDate - now) / (1000 * 60 * 60 * 24));
    const dateStr = showDate.toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    let bars = '';
    for (let i = 0; i < 40; i++) bars += '<span></span>';

    ticketView.innerHTML = `
      <div class="ticket-card">
        <div class="ticket-header">
          <span class="ticket-type">${currentLang === 'fr' ? 'Billet officiel' : 'Official Ticket'}</span>
          <span class="ticket-id">#SE-${String(nextShow.id).padStart(5, '0')}</span>
        </div>
        <div class="ticket-main">
          <div>
            <h3>Stephan Eicher</h3>
            <div class="ticket-venue">${nextShow.venue}</div>
          </div>
          <div class="ticket-countdown">
            <div class="label">${currentLang === 'fr' ? 'Jours restants' : 'Days until show'}</div>
            <div class="days">${diffDays}<small> ${currentLang === 'fr' ? 'jours' : 'days'}</small></div>
          </div>
        </div>
        <div class="ticket-footer">
          <span>${dateStr} · ${currentLang === 'fr' ? 'Ouverture 19h30' : 'Doors 7:30 PM'}</span>
          <div class="barcode">${bars}</div>
        </div>
      </div>`;
  } else {
    ticketView.innerHTML = `<div class="no-ticket">${currentLang === 'fr' ? 'Aucun concert à venir. Réservez votre prochaine date !' : 'No upcoming shows. Book your next date!'}</div>`;
  }

  const list = document.getElementById('dashBookings');
  const header = `
    <div class="booking-header">
      <span>${currentLang === 'fr' ? 'Date' : 'Date'}</span>
      <span>${currentLang === 'fr' ? 'Lieu' : 'Venue'}</span>
      <span>${currentLang === 'fr' ? 'Statut' : 'Status'}</span>
      <span></span>
    </div>`;
  const rows = bookings.map(b => {
    const d = new Date(b.date);
    const dateShort = d.toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const statusClass = b.status === 'confirmed' ? 'confirmed' : 'pending';
    const statusLabel = b.status === 'confirmed'
      ? (currentLang === 'fr' ? 'Confirmé' : 'Confirmed')
      : (currentLang === 'fr' ? 'En attente' : 'Pending');
    return `
      <div class="booking-row">
        <span class="b-date">${dateShort}</span>
        <span class="b-venue">${b.venue}<span>${currentLang === 'fr' ? 'Billet électronique' : 'E-ticket'}</span></span>
        <span class="b-status ${statusClass}">${statusLabel}</span>
        <span style="font-size:0.75rem; color:var(--muted);">#${b.id}</span>
      </div>`;
  }).join('');
  list.innerHTML = header + rows;
}

function submitBooking() {
  const dateVal = document.getElementById('bookingDate').value;
  const venueVal = document.getElementById('bookingVenue').value.trim();
  if (!dateVal || !venueVal) {
    alert(currentLang === 'fr' ? 'Veuillez remplir la date et le lieu.' : 'Please fill in the date and venue.');
    return;
  }
  const bookings = loadBookings();
  bookings.push({ id: nextBookingId(), client: 'Client', date: dateVal, venue: venueVal, status: 'pending' });
  saveBookings(bookings);
  closeModal('bookingModal');
  document.getElementById('bookingDate').value = '';
  document.getElementById('bookingVenue').value = '';
  renderCustomerDashboard();
}

/* ============================================================
   TOUR DATES (index only)
   ============================================================ */
const tourDates = [
  { date: '2026-12-15', venue: 'Olympia', city: 'Paris', status: 'sold' },
  { date: '2027-01-20', venue: 'Le Liberchies', city: 'Bruxelles', status: 'ok' },
  { date: '2027-02-10', venue: 'Zénith', city: 'Lille', status: 'ok' },
  { date: '2027-03-05', venue: 'Halle Tony Garnier', city: 'Lyon', status: 'prem' },
  { date: '2027-03-28', venue: 'Le Dôme', city: 'Marseille', status: 'ok' },
  { date: '2027-04-18', venue: 'Casino de Paris', city: 'Paris', status: 'flux' },
];
const songbookDates = [
  { date: '2027-09-12', venue: 'Kunsthaus', city: 'Zurich', status: 'ok' },
  { date: '2027-09-19', venue: 'Stade de Suisse', city: 'Berne', status: 'ok' },
  { date: '2027-10-03', venue: 'Victoria Hall', city: 'Genève', status: 'prem' },
];

function renderTourDates() {
  if (isAdminPage) return;
  const lang = currentLang;
  const labels = {
    ok: lang === 'fr' ? 'Disponible' : 'Available',
    sold: lang === 'fr' ? 'Complet' : 'Sold out',
    prem: lang === 'fr' ? 'Première' : 'Premiere',
    flux: 'Flux'
  };
  function badge(s) { return `<span class="badge ${s}">${labels[s]}</span>`; }
  function fmt(ds) {
    const d = new Date(ds);
    return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  const fr = document.getElementById('tourDatesFR');
  const sb = document.getElementById('songbookDates');
  if (fr) fr.innerHTML = tourDates.map(t => `
    <div class="date-row">
      <div class="d">${fmt(t.date)}</div>
      <div class="v"><strong>${t.venue}</strong><span>${t.city}</span></div>
      ${badge(t.status)}
    </div>`).join('');
  if (sb) sb.innerHTML = songbookDates.map(t => `
    <div class="date-row">
      <div class="d">${fmt(t.date)}</div>
      <div class="v"><strong>${t.venue}</strong><span>${t.city}</span></div>
      ${badge(t.status)}
    </div>`).join('');
}

/* ============================================================
   ADMIN PAGE LOGIC (admin.html only)
   ============================================================ */
function handleAdminLogin() {
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value.trim();
  const err = document.getElementById('loginError');
  if (user === 'admin' && pass === 'admin123') {
    sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
    showAdminDashboard();
  } else {
    err.style.display = 'block';
    err.textContent = 'Identifiants invalides. Utilisez admin / admin123.';
  }
}

function showAdminDashboard() {
  document.getElementById('loginView').style.display = 'none';
  document.getElementById('adminMain').classList.add('active');
  adminLoadBookings();
}

function adminLogout() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  document.getElementById('adminMain').classList.remove('active');
  document.getElementById('loginView').style.display = 'flex';
  document.getElementById('loginError').style.display = 'none';
}

function formatAdminDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function adminLoadBookings() {
  if (!document.getElementById('adminBookingsTable')) return;
  const bookings = loadBookings();
  const tbody = document.getElementById('adminBookingsTable');

  document.getElementById('statTotal').textContent = bookings.length;
  document.getElementById('statConfirmed').textContent = bookings.filter(b => b.status === 'confirmed').length;
  document.getElementById('statPending').textContent = bookings.filter(b => b.status === 'pending').length;

  if (!bookings.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">Aucune réservation pour le moment.</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td style="color:var(--muted); font-family:monospace;">#${String(b.id).padStart(4, '0')}</td>
      <td>${b.client}</td>
      <td>${formatAdminDate(b.date)}</td>
      <td>${b.venue}</td>
      <td>
        <select class="status-select" onchange="adminUpdateStatus(${b.id}, this.value)">
          <option value="pending" ${b.status === 'pending' ? 'selected' : ''}>En attente</option>
          <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>Confirmé</option>
        </select>
      </td>
      <td>
        <div class="row-actions">
          <button onclick="adminDeleteBooking(${b.id})">Supprimer</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function adminUpdateStatus(id, status) {
  const bookings = loadBookings();
  const b = bookings.find(x => x.id === id);
  if (b) {
    b.status = status;
    saveBookings(bookings);
    adminLoadBookings();
  }
}

function adminDeleteBooking(id) {
  if (!confirm('Supprimer cette réservation ?')) return;
  const bookings = loadBookings().filter(b => b.id !== id);
  saveBookings(bookings);
  adminLoadBookings();
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (isAdminPage) {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY) === '1') {
      showAdminDashboard();
    }
    const passInput = document.getElementById('adminPass');
    if (passInput) {
      passInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAdminLogin();
      });
    }
  } else {
    renderTourDates();
    document.querySelectorAll('.modal-overlay').forEach(o => {
      o.addEventListener('click', (e) => { if (e.target === o) o.classList.remove('active'); });
    });
    const lp = document.getElementById('loginPass');
    if (lp) lp.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
  }
});
