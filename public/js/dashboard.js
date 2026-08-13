// ============================================================
//  Dashboard Page
// ============================================================

function renderDashboard() {
  const stats = DB.Stats.summary();
  const recent = DB.Stats.recentPayments(6);
  const students = DB.Students.all();
  const courses = DB.Courses.all();

  // Stat cards
  document.getElementById('stat-total-students').textContent    = stats.totalStudents;
  document.getElementById('stat-active-students').textContent   = stats.activeStudents;
  document.getElementById('stat-fees-collected').textContent    = fmtCurrency(stats.totalFeesPaid);
  document.getElementById('stat-fees-pending').textContent      = fmtCurrency(stats.totalFeesBalance);
  document.getElementById('stat-paid-count').textContent        = stats.paidCount;
  document.getElementById('stat-pending-count').textContent     = stats.pendingCount;

  // Collection progress
  const pct = stats.totalFeesDue ? Math.round((stats.totalFeesPaid / stats.totalFeesDue) * 100) : 0;
  document.getElementById('collection-pct').textContent = pct + '%';
  document.getElementById('collection-bar').style.width = pct + '%';
  document.getElementById('collection-bar').className   = 'progress-bar ' + (pct >= 80 ? 'green' : pct >= 50 ? 'orange' : 'red');
  document.getElementById('collection-label').textContent =
    `${fmtCurrency(stats.totalFeesPaid)} collected of ${fmtCurrency(stats.totalFeesDue)}`;

  // Donut chart (SVG)
  renderDonut(stats.paidCount, stats.partialCount, stats.pendingCount);

  // Monthly bar chart
  renderBarChart();

  // Recent payments table
  const tbody = document.getElementById('recent-payments-body');
  if (!recent.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:24px">No payments recorded yet.</td></tr>`;
  } else {
    tbody.innerHTML = recent.map(p => {
      const student = DB.Students.get(p.studentId);
      return `<tr>
        <td>${p.receiptNo || '—'}</td>
        <td>${student ? student.name : '—'}<br><small class="text-muted">${student ? student.rollNo : ''}</small></td>
        <td>${fmtCurrency(p.paidAmount)}</td>
        <td>${fmtDate(p.paymentDate)}</td>
        <td>${statusBadge(p.status)}</td>
      </tr>`;
    }).join('');
  }

  // Students per course
  const courseCounts = {};
  courses.forEach(c => { courseCounts[c.id] = 0; });
  students.forEach(s => { courseCounts[s.courseId] = (courseCounts[s.courseId] || 0) + 1; });

  const courseList = document.getElementById('course-student-list');
  courseList.innerHTML = courses.map(c => {
    const count = courseCounts[c.id] || 0;
    const maxPossible = Math.max(...Object.values(courseCounts), 1);
    const pct = Math.round((count / maxPossible) * 100);
    return `<div style="margin-bottom:14px">
      <div class="flex justify-between items-center mb-2" style="margin-bottom:6px">
        <span style="font-size:.85rem;font-weight:600">${c.name}</span>
        <span style="font-size:.82rem;color:var(--text-muted)">${count} students</span>
      </div>
      <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}

// ── Donut SVG ────────────────────────────────────────────────
function renderDonut(paid, partial, pending) {
  const total = paid + partial + pending || 1;
  const data = [
    { val: paid,    color: '#16a34a', label: 'Paid'    },
    { val: partial, color: '#d97706', label: 'Partial' },
    { val: pending, color: '#dc2626', label: 'Pending' },
  ];

  const r = 60, cx = 70, cy = 70, stroke = 24;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  let segments = '';
  data.forEach(d => {
    const dash = (d.val / total) * circ;
    segments += `<circle
      cx="${cx}" cy="${cy}" r="${r}"
      fill="none" stroke="${d.color}" stroke-width="${stroke}"
      stroke-dasharray="${dash} ${circ - dash}"
      stroke-dashoffset="${-offset}"
      transform="rotate(-90 ${cx} ${cy})"
    />`;
    offset += dash;
  });

  document.getElementById('donut-chart').innerHTML = `
    <svg class="donut-svg" width="140" height="140" viewBox="0 0 140 140">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f1f5f9" stroke-width="${stroke}"/>
      ${segments}
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
        font-size="13" font-weight="800" fill="#1e293b">${total}</text>
      <text x="${cx}" y="${cy+16}" text-anchor="middle" dominant-baseline="middle"
        font-size="9" fill="#64748b">payments</text>
    </svg>`;

  document.getElementById('donut-legend').innerHTML = data.map(d =>
    `<div class="legend-item">
      <div class="legend-dot" style="background:${d.color}"></div>
      <span>${d.label}: <strong>${d.val}</strong></span>
    </div>`
  ).join('');
}

// ── Bar chart ────────────────────────────────────────────────
function renderBarChart() {
  const monthData = DB.Stats.collectionByMonth();
  const container = document.getElementById('bar-chart');
  if (!monthData.length) {
    container.innerHTML = '<p class="text-muted text-center" style="width:100%">No data yet.</p>';
    return;
  }

  const maxVal = Math.max(...monthData.map(([,v]) => v), 1);

  container.innerHTML = monthData.map(([month, val]) => {
    const heightPct = Math.round((val / maxVal) * 100);
    const label = new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    return `<div class="bar-item">
      <span class="bar-val">${val >= 100000 ? (val/100000).toFixed(1)+'L' : fmtCurrency(val)}</span>
      <div class="bar" style="height:${heightPct}%;max-height:160px;min-height:6px"></div>
      <span class="bar-label">${label}</span>
    </div>`;
  }).join('');
}
