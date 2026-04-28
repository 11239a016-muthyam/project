// script.js — shared utilities for SCSVMV Event Management System
document.addEventListener('DOMContentLoaded', () => {
  // DB init (safe to call multiple times)
  if (typeof DB !== 'undefined') DB.init();

  // Async-safe Auth init + nav injection (only if Auth exists)
  if (typeof Auth !== 'undefined') {
    Auth.init().then(() => {
      const navMenu = document.getElementById('navMenu');
      const isSubDir = window.location.pathname.includes('/admin/');
      if (navMenu) Auth.injectNavUser(navMenu, isSubDir);
    });
  }

  // Hamburger menu
  const ham = document.querySelector('.ham');
  const navUl = document.querySelector('nav ul');
  if (ham && navUl) ham.addEventListener('click', () => navUl.classList.toggle('open'));

  // Active nav link highlight
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav ul li a').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
});

/* ── Toast ── */
function showToast(msg, type = 'info') {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  const icons = { success: 'check-circle', error: 'times-circle', info: 'info-circle', warning: 'exclamation-triangle' };
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'}"></i> ${msg}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

/* ── Format helpers ── */
function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = +h, suffix = hr >= 12 ? 'PM' : 'AM';
  return `${hr % 12 || 12}:${m} ${suffix}`;
}
function seatsPercent(reg, max) { return max > 0 ? Math.min(Math.round((reg / max) * 100), 100) : 0; }
function starHTML(rating) {
  let s = '';
  for (let i = 1; i <= 5; i++)
    s += `<i class="fa${i <= rating ? 's' : 'r'} fa-star" style="color:${i <= rating ? '#f59e0b' : '#d1d5db'}"></i>`;
  return s;
}

/* ── Build event card ── */
function buildEventCard(ev, basePath = '') {
  const pct = seatsPercent(+ev.registered_count, +ev.max_participants);
  const statusClass = ev.status === 'upcoming' ? 'badge-upcoming' : 'badge-completed';
  return `
  <div class="event-card">
    <div class="event-image" style="background-image:url('${ev.image_url}');background-size:cover;background-position:center">
      <span class="event-category">${ev.category}</span>
      <span class="event-status-badge ${statusClass}">${ev.status}</span>
    </div>
    <div class="event-content">
      <div class="event-title">${ev.title}</div>
      <div class="event-info"><i class="fas fa-calendar"></i>${fmtDate(ev.date)} &nbsp; <i class="fas fa-clock"></i>${fmtTime(ev.time)}</div>
      <div class="event-info"><i class="fas fa-map-marker-alt"></i>${ev.venue}</div>
      <div class="event-info"><i class="fas fa-user"></i>${ev.organizer_name}
        <span class="badge badge-${ev.organizer_type === 'faculty' ? 'blue' : 'orange'}" style="margin-left:.4rem">${ev.organizer_type}</span>
      </div>
      <p class="event-desc">${ev.description ? ev.description.slice(0, 110) + '...' : ''}</p>
      <div class="seats-bar"><div class="seats-fill" style="width:${pct}%"></div></div>
      <div class="seats-text">${ev.registered_count}/${ev.max_participants} registered (${pct}% full)</div>
      <div class="card-footer" style="margin-top:1rem">
        <a href="${basePath}event-details.html?id=${ev.id}" class="btn btn-outline btn-sm">View Details</a>
        ${ev.status === 'upcoming'
          ? `<a href="${basePath}register.html?event=${ev.id}" class="btn btn-primary btn-sm">Register</a>`
          : '<span class="badge badge-green">Completed</span>'}
      </div>
    </div>
  </div>`;
}

/* ── Download CSV ── */
function exportTable(table) { DB.downloadCSV(table); showToast(`${table}.csv downloaded`, 'success'); }
