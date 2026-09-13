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
    dashboard:  'Dashboard',
    students:   'Students',
    fees:       'Fee Structure',
    payments:   'Payments',
    reports:    'Reports',
    subjects:   'Subjects',
    timetable:  'Timetable',
    attendance: 'Attendance',
    exams:      'Exam Results',
  };
  document.getElementById('topbar-title').textContent = titles[pageId] || 'Dashboard';

  // refresh page data
  switch (pageId) {
    case 'dashboard':  renderDashboard();         break;
    case 'students':   renderStudents();           break;
    case 'fees':       renderFees();               break;
    case 'payments':   renderPayments();           break;
    case 'reports':    renderReports();            break;
    case 'subjects':   renderSubjects();           break;
    case 'timetable':  renderTimetableAdmin();     break;
    case 'attendance': renderAttendanceAdmin();    break;
    case 'exams':      renderExamsAdmin();         break;
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
document.addEventListener('DOMContentLoaded', async () => {

  // Show loading overlay while data fetches from Supabase
  document.body.insertAdjacentHTML('beforeend', `
    <div id="db-loading" style="position:fixed;inset:0;background:rgba(255,255,255,.92);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px">
      <div style="width:44px;height:44px;border:4px solid #e2e8f0;border-top-color:#2563eb;border-radius:50%;animation:spin .8s linear infinite"></div>
      <p style="color:#475569;font-size:.95rem;font-weight:600">Loading data…</p>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </div>`);

  const ok = await DB.load();

  document.getElementById('db-loading').remove();

  if (!ok) {
    document.body.insertAdjacentHTML('beforeend', `
      <div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#fee2e2;color:#991b1b;padding:12px 24px;border-radius:10px;font-weight:600;font-size:.9rem;box-shadow:0 4px 12px rgba(0,0,0,.1)">
        ⚠️ Could not connect to database. Check your internet connection.
      </div>`);
  }

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
