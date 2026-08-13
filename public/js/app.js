// ============================================================
//  College Fees Management System — App Shell
// ============================================================

// ── Toast ────────────────────────────────────────────────────
function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ── Navigation ───────────────────────────────────────────────
function navigate(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');

  const link = document.querySelector(`[data-page="${pageId}"]`);
  if (link) link.classList.add('active');

  const titles = {
    dashboard: 'Dashboard',
    students:  'Students',
    fees:      'Fee Structure',
    payments:  'Payments',
    reports:   'Reports',
  };
  document.getElementById('topbar-title').textContent = titles[pageId] || 'Dashboard';

  // refresh page data
  switch (pageId) {
    case 'dashboard': renderDashboard(); break;
    case 'students':  renderStudents();  break;
    case 'fees':      renderFees();      break;
    case 'payments':  renderPayments();  break;
    case 'reports':   renderReports();   break;
  }

  // close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
}

// ── Format helpers ───────────────────────────────────────────
function fmtCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusBadge(status) {
  const map = {
    Paid:     'badge-success',
    Partial:  'badge-warning',
    Pending:  'badge-danger',
    Active:   'badge-success',
    Inactive: 'badge-secondary',
  };
  return `<span class="badge ${map[status] || 'badge-info'}">${status}</span>`;
}

// ── Modal helpers ────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// close on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ── Confirm dialog ───────────────────────────────────────────
function confirmAction(msg) {
  return window.confirm(msg);
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  DB.seed();

  // nav links
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.addEventListener('click', () => navigate(link.dataset.page));
  });

  // mobile menu
  const mobileBtn = document.getElementById('mobile-menu-btn');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
  }

  // start on dashboard
  navigate('dashboard');
});
