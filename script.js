'use strict';

/* ============================================================
   STOCKAGE LOCAL
   Démonstration seulement : les données ne sont pas partagées
   entre les appareils et ne constituent pas un stockage sécurisé.
   ============================================================ */
const STORAGE_KEY = 'stephan_eicher_bookings';
const ADMIN_SESSION_KEY = 'se_admin_logged_in';

function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidBooking) : [];
  } catch (error) {
    console.error('Impossible de lire les réservations locales :', error);
    return [];
  }
}

function isValidBooking(booking) {
  return booking &&
    Number.isInteger(Number(booking.id)) &&
    typeof booking.date === 'string' &&
    typeof booking.venue === 'string';
}

function saveBookings(bookings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    return true;
  } catch (error) {
    console.error('Impossible d’enregistrer les réservations locales :', error);
    return false;
  }
}

function nextBookingId() {
  const bookings = loadBookings();
  return bookings.reduce((max, booking) => {
    return Math.max(max, Number(booking.id) || 0);
  }, 0) + 1;
}

/* ============================================================
   OUTILS
   ============================================================ */
const isAdminPage = document.body.classList.contains('admin-page');

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '''
  })[character]);
}

function getLocalDate(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateString));
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDate(dateString, locale, options) {
  const date = getLocalDate(dateString);
  return date ? date.toLocaleDateString(locale, options) : dateString;
}

/* ============================================================
   LANGUE — PAGE D’ACCUEIL
   ============================================================ */
let currentLang = 'fr';

function toggleLanguage() {
  currentLang = currentLang === 'fr' ? 'en' : 'fr';

  const frButton = document.getElementById('langFR');
  const enButton = document.getElementById('langEN');

  if (frButton) {
    frButton.classList.toggle('active', currentLang === 'fr');
    frButton.classList.toggle('inactive', currentLang !== 'fr');
  }

  if (enButton) {
    enButton.classList.toggle('active', currentLang === 'en');
    enButton.classList.toggle('inactive', currentLang !== 'en');
  }

  document.querySelectorAll('[data-fr][data-en]').forEach(element => {
    element.textContent = currentLang === 'fr'
      ? element.dataset.fr
      : element.dataset.en;
  });

  const loginButton = document.getElementById('loginBtn');
  if (loginButton) {
    loginButton.textContent = currentLang === 'fr' ? 'Connexion' : 'Log in';
  }

  if (document.getElementById('dashboardPanel')?.classList.contains('active')) {
    renderCustomerDashboard();
  }

  renderTourDates();
}

/* ============================================================
   MODALES — PAGE D’ACCUEIL
   ============================================================ */
function openLogin() {
  document.getElementById('loginModal')?.classList.add('active');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
}

function openBookingForm() {
  const modal = document.getElementById('bookingModal');
  const button = document.querySelector('.booking-button');

  modal?.classList.add('active');
  button?.classList.add('active');
  button?.setAttribute('aria-expanded', 'true');
}

function closeBookingForm() {
  document.getElementById('bookingModal')?.classList.remove('active');

  const button = document.querySelector('.booking-button');
  button?.classList.remove('active');
  button?.setAttribute('aria-expanded', 'false');
}

/* ============================================================
   CONNEXION CLIENT — DÉMONSTRATION UNIQUEMENT
   ============================================================ */
function handleLogin() {
  const username = document.getElementById('loginUser')?.value.trim();
  const password = document.getElementById('loginPass')?.value.trim();

  // Ces identifiants sont visibles dans le JavaScript téléchargé par tous.
  // Ne pas les utiliser pour protéger de vraies données.
  if (username === 'client' && password === 'client123') {
    closeModal('loginModal');
    startCustomerBuffer();
  } else {
    alert(currentLang === 'fr'
      ? 'Identifiants invalides.'
      : 'Invalid credentials.');
  }
}

let bufferInterval = null;

function startCustomerBuffer() {
  const overlay = document.getElementById('dashboardOverlay');
  const bufferScreen = document.getElementById('bufferScreen');
  const dashboardPanel = document.getElementById('dashboardPanel');

  if (!overlay || !bufferScreen || !dashboardPanel) return;

  overlay.classList.add('active');
  bufferScreen.classList.add('active');
  dashboardPanel.classList.remove('active');

  let count = 7;
  const countdown = document.getElementById('bufferCountdown');
  const fill = document.getElementById('bufferFill');

  if (countdown) countdown.textContent = String(count);
  if (fill) fill.style.width = '0%';

  if (bufferInterval) clearInterval(bufferInterval);

  bufferInterval = setInterval(() => {
    count -= 1;

    if (countdown) countdown.textContent = String(count);
    if (fill) fill.style.width = `${((7 - count) / 7) * 100}%`;

    if (count <= 0) {
      clearInterval(bufferInterval);
      bufferInterval = null;
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

  if (bufferInterval) {
    clearInterval(bufferInterval);
    bufferInterval = null;
  }
}

function renderCustomerDashboard() {
  const dashboard = document.getElementById('dashboardPanel');
  if (!dashboard) return;

  const welcome = document.getElementById('dashWelcome');
  const username = document.getElementById('dashUserName');

  if (welcome) {
    welcome.textContent = currentLang === 'fr' ? 'Bienvenue' : 'Welcome back';
  }

  if (username) {
    username.textContent = currentLang === 'fr'
      ? 'Bonjour, Client'
      : 'Hello, Client';
  }

  const bookings = loadBookings();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = bookings
    .filter(booking => {
      const date = getLocalDate(booking.date);
      return date && date >= today;
    })
    .sort((a, b) => {
      return getLocalDate(a.date) - getLocalDate(b.date);
    });

  const nextShow = upcoming[0];
  const ticketView = document.getElementById('customerTicketView');

  if (ticketView) {
    if (nextShow) {
      const showDate = getLocalDate(nextShow.date);
      const diffDays = Math.ceil((showDate - today) / 86400000);
      const locale = currentLang === 'fr' ? 'fr-FR' : 'en-GB';
      const dateText = showDate.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const bars = '<span></span>'.repeat(40);

      ticketView.innerHTML = `
        <div class="ticket-card">
          <div class="ticket-header">
            <span class="ticket-type">
              ${currentLang === 'fr' ? 'Billet officiel' : 'Official Ticket'}
            </span>
            <span class="ticket-id">
              #SE-${String(nextShow.id).padStart(5, '0')}
            </span>
          </div>
          <div class="ticket-main">
            <div>
              <h3>Stephan Eicher</h3>
              <div class="ticket-venue">${escapeHTML(nextShow.venue)}</div>
            </div>
            <div class="ticket-countdown">
              <div class="label">
                ${currentLang === 'fr' ? 'Jours restants' : 'Days until show'}
              </div>
              <div class="days">
                ${diffDays}<small>
                  ${currentLang === 'fr' ? 'jours' : 'days'}
                </small>
              </div>
            </div>
          </div>
          <div class="ticket-footer">
            <span>${dateText} · ${
              currentLang === 'fr' ? 'Ouverture 19h30' : 'Doors 7:30 PM'
            }</span>
            <div class="barcode" aria-hidden="true">${bars}</div>
          </div>
        </div>`;
    } else {
      ticketView.innerHTML = `
        <div class="no-ticket">
          ${currentLang === 'fr'
            ? 'Aucun concert à venir. Réservez votre prochaine date !'
            : 'No upcoming shows. Book your next date!'}
        </div>`;
    }
  }

  const list = document.getElementById('dashBookings');
  if (!list) return;

  const headers = `
    <div class="booking-header">
      <span>${currentLang === 'fr' ? 'Date' : 'Date'}</span>
      <span>${currentLang === 'fr' ? 'Lieu' : 'Venue'}</span>
      <span>${currentLang === 'fr' ? 'Statut' : 'Status'}</span>
      <span></span>
    </div>`;

  const rows = bookings.map(booking => {
    const locale = currentLang === 'fr' ? 'fr-FR' : 'en-GB';
    const dateText = formatDate(booking.date, locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const confirmed = booking.status === 'confirmed';
    const statusText = confirmed
      ? (currentLang === 'fr' ? 'Confirmé' : 'Confirmed')
      : (currentLang === 'fr' ? 'En attente' : 'Pending');

    return `
      <div class="booking-row">
        <span class="b-date">${escapeHTML(dateText)}</span>
        <span class="b-venue">
          ${escapeHTML(booking.venue)}
          <span>${currentLang === 'fr' ? 'Demande' : 'Request'}</span>
        </span>
        <span class="b-status ${confirmed ? 'confirmed' : 'pending'}">
          ${statusText}
        </span>
        <span class="booking-id">#${Number(booking.id)}</span>
      </div>`;
  }).join('');

  list.innerHTML = headers + rows;
}

/* ============================================================
   ENVOI DE RÉSERVATION À NETLIFY FORMS
   Le formulaire correspondant doit être déclaré dans index.html.
   ============================================================ */
async function submitBooking(event) {
  if (event) event.preventDefault();

  const form = document.getElementById('bookingForm');
  if (!form) {
    alert(currentLang === 'fr'
      ? 'Formulaire de réservation introuvable.'
      : 'Booking form not found.');
    return;
  }

  if (!form.reportValidity()) return;

  const formData = new FormData(form);
  const booking = {
    client: String(formData.get('name') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
    date: String(formData.get('date') || '').trim(),
    venue: String(formData.get('venue') || '').trim(),
    eventType: String(formData.get('eventType') || '').trim(),
    message: String(formData.get('message') || '').trim(),
    status: 'pending'
  };

  if (!booking.client || !booking.email || !booking.date || !booking.venue) {
    alert(currentLang === 'fr'
      ? 'Veuillez remplir tous les champs obligatoires.'
      : 'Please fill in all required fields.');
    return;
  }

  if (!getLocalDate(booking.date)) {
    alert(currentLang === 'fr'
      ? 'La date choisie est invalide.'
      : 'The selected date is invalid.');
    return;
  }

  const submitButton = form.querySelector('[type="submit"]');
  if (submitButton) submitButton.disabled = true;

  try {
    const payload = new URLSearchParams();
    payload.append('form-name', 'booking');
    payload.append('name', booking.client);
    payload.append('email', booking.email);
    payload.append('phone', booking.phone);
    payload.append('date', booking.date);
    payload.append('venue', booking.venue);
    payload.append('eventType', booking.eventType);
    payload.append('message', booking.message);

    const honeypot = form.querySelector('[name="bot-field"]');
    if (honeypot) payload.append('bot-field', honeypot.value);

    const response = await fetch('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: payload.toString()
    });

    if (!response.ok) {
      throw new Error(`Netlify Forms a répondu avec le code ${response.status}`);
    }

    // Copie locale pour l’aperçu sur cet appareil seulement.
    const bookings = loadBookings();
    bookings.push({
      id: nextBookingId(),
      client: booking.client,
      email: booking.email,
      phone: booking.phone,
      date: booking.date,
      venue: booking.venue,
      eventType: booking.eventType,
      message: booking.message,
      status: 'pending'
    });
    saveBookings(bookings);

    form.reset();
    closeBookingForm();

    if (document.getElementById('dashboardPanel')?.classList.contains('active')) {
      renderCustomerDashboard();
    }

    alert(currentLang === 'fr'
      ? 'Votre demande a bien été envoyée.'
      : 'Your request has been sent.');
  } catch (error) {
    console.error('Échec de l’envoi du formulaire :', error);
    alert(currentLang === 'fr'
      ? 'La demande n’a pas pu être envoyée. Réessayez plus tard.'
      : 'The request could not be sent. Please try again later.');
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

/* ============================================================
   DATES DE TOURNÉE
   Vérifiez ces dates avant publication.
   ============================================================ */
const tourDates = [
  { date: '2026-12-15', venue: 'Olympia', city: 'Paris', status: 'sold' },
  { date: '2027-01-20', venue: 'Le Liberchies', city: 'Bruxelles', status: 'ok' },
  { date: '2027-02-10', venue: 'Zénith', city: 'Lille', status: 'ok' },
  { date: '2027-03-05', venue: 'Halle Tony Garnier', city: 'Lyon', status: 'prem' },
  { date: '2027-03-28', venue: 'Le Dôme', city: 'Marseille', status: 'ok' },
  { date: '2027-04-18', venue: 'Casino de Paris', city: 'Paris', status: 'flux' }
];

const songbookDates = [
  { date: '2027-09-12', venue: 'Kunsthaus', city: 'Zurich', status: 'ok' },
  { date: '2027-09-19', venue: 'Stade de Suisse', city: 'Berne', status: 'ok' },
  { date: '2027-10-03', venue: 'Victoria Hall', city: 'Genève', status: 'prem' }
];

function renderTourDates() {
  if (isAdminPage) return;

  const labels = {
    ok: currentLang === 'fr' ? 'Disponible' : 'Available',
    sold: currentLang === 'fr' ? 'Complet' : 'Sold out',
    prem: currentLang === 'fr' ? 'Première' : 'Premiere',
    flux: 'Flux'
  };

  function renderRows(dates) {
    return dates.map(item => {
      const dateText = formatDate(
        item.date,
        currentLang === 'fr' ? 'fr-FR' : 'en-GB',
        { day: '2-digit', month: 'short', year: 'numeric' }
      );

      return `
        <div class="date-row">
          <div class="d">${escapeHTML(dateText)}</div>
          <div class="v">
            <strong>${escapeHTML(item.venue)}</strong>
            <span>${escapeHTML(item.city)}</span>
          </div>
          <span class="badge ${escapeHTML(item.status)}">
            ${escapeHTML(labels[item.status] || item.status)}
          </span>
        </div>`;
    }).join('');
  }

  const tourContainer = document.getElementById('tourDatesFR');
  const songbookContainer = document.getElementById('songbookDates');

  if (tourContainer) tourContainer.innerHTML = renderRows(tourDates);
  if (songbookContainer) songbookContainer.innerHTML = renderRows(songbookDates);
}

/* ============================================================
   ADMIN — DÉMONSTRATION UNIQUEMENT
   Authentification côté navigateur, non sécurisée.
   ============================================================ */
function handleAdminLogin() {
  const username = document.getElementById('adminUser')?.value.trim();
  const password = document.getElementById('adminPass')?.value.trim();
  const error = document.getElementById('loginError');

  // Ces identifiants sont visibles dans le code source du site.
  // Utilisez une authentification serveur pour un vrai accès admin.
  if (username === 'admin' && password === 'admin123') {
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
    } catch (storageError) {
      console.error('Session non disponible :', storageError);
    }

    showAdminDashboard();
  } else if (error) {
    error.style.display = 'block';
    error.textContent = 'Identifiants invalides.';
  }
}

function showAdminDashboard() {
  const loginView = document.getElementById('loginView');
  const adminMain = document.getElementById('adminMain');

  if (loginView) loginView.style.display = 'none';
  if (adminMain) adminMain.classList.add('active');

  adminLoadBookings();
}

function adminLogout() {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (error) {
    console.error('Impossible de fermer la session :', error);
  }

  document.getElementById('adminMain')?.classList.remove('active');

  const loginView = document.getElementById('loginView');
  if (loginView) loginView.style.display = 'flex';

  const error = document.getElementById('loginError');
  if (error) error.style.display = 'none';
}

function formatAdminDate(dateString) {
  return formatDate(dateString, 'fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function adminLoadBookings() {
  const table = document.getElementById('adminBookingsTable');
  if (!table) return;

  const bookings = loadBookings();

  const total = document.getElementById('statTotal');
  const confirmed = document.getElementById('statConfirmed');
  const pending = document.getElementById('statPending');

  if (total) total.textContent = String(bookings.length);
  if (confirmed) {
    confirmed.textContent = String(
      bookings.filter(booking => booking.status === 'confirmed').length
    );
  }
  if (pending) {
    pending.textContent = String(
      bookings.filter(booking => booking.status !== 'confirmed').length
    );
  }

  if (!bookings.length) {
    table.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">Aucune réservation locale pour le moment.</td>
      </tr>`;
    return;
  }

  table.innerHTML = bookings.map(booking => {
    const id = Number(booking.id);
    const status = booking.status === 'confirmed' ? 'confirmed' : 'pending';

    return `
      <tr>
        <td style="color:var(--muted);font-family:monospace">
          #${String(id).padStart(4, '0')}
        </td>
        <td>${escapeHTML(booking.client || 'Client')}</td>
        <td>${escapeHTML(formatAdminDate(booking.date))}</td>
        <td>${escapeHTML(booking.venue)}</td>
        <td>
          <select class="status-select"
                  onchange="adminUpdateStatus(${id}, this.value)"
                  aria-label="Statut de la réservation ${id}">
            <option value="pending" ${status === 'pending' ? 'selected' : ''}>
              En attente
            </option>
            <option value="confirmed" ${status === 'confirmed' ? 'selected' : ''}>
              Confirmé
            </option>
          </select>
        </td>
        <td>
          <div class="row-actions">
            <button type="button" onclick="adminDeleteBooking(${id})">
              Supprimer
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function adminUpdateStatus(id, status) {
  if (!['pending', 'confirmed'].includes(status)) return;

  const bookings = loadBookings();
  const booking = bookings.find(item => Number(item.id) === Number(id));

  if (!booking) return;

  booking.status = status;
  saveBookings(bookings);
  adminLoadBookings();
}

function adminDeleteBooking(id) {
  if (!confirm('Supprimer cette réservation locale ?')) return;

  const bookings = loadBookings().filter(item => Number(item.id) !== Number(id));
  saveBookings(bookings);
  adminLoadBookings();
}

/* ============================================================
   INITIALISATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (isAdminPage) {
    let isLoggedIn = false;

    try {
      isLoggedIn = sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
    } catch (error) {
      console.error('Session non disponible :', error);
    }

    if (isLoggedIn) showAdminDashboard();

    const adminPassword = document.getElementById('adminPass');
    adminPassword?.addEventListener('keydown', event => {
      if (event.key === 'Enter') handleAdminLogin();
    });

    return;
  }

  renderTourDates();

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', event => {
      if (event.target !== overlay) return;

      overlay.classList.remove('active');

      if (overlay.id === 'bookingModal') {
        document.querySelector('.booking-button')?.classList.remove('active');
        document.querySelector('.booking-button')?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.getElementById('bookingForm')?.addEventListener('submit', submitBooking);

  document.getElementById('loginPass')?.addEventListener('keydown', event => {
    if (event.key === 'Enter') handleLogin();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(modal => {
        modal.classList.remove('active');
      });

      document.querySelector('.booking-button')?.classList.remove('active');
      document.querySelector('.booking-button')?.setAttribute('aria-expanded', 'false');
    }
  });
});
