// ============================================================
//  Reports Page
// ============================================================

function renderReports() {
  renderFeeCollectionReport();
  renderDefaulterReport();
  renderCourseWiseReport();
}

// ── Fee Collection Summary ───────────────────────────────────
function renderFeeCollectionReport() {
  const payments = DB.Payments.all();
  const total     = payments.reduce((s,p) => s + p.amount, 0);
  const collected = payments.reduce((s,p) => s + p.paidAmount, 0);
  const balance   = total - collected;
  const pct       = total ? Math.round((collected/total)*100) : 0;

  document.getElementById('rpt-total-due').textContent      = fmtCurrency(total);
  document.getElementById('rpt-collected').textContent      = fmtCurrency(collected);
  document.getElementById('rpt-balance').textContent        = fmtCurrency(balance);
  document.getElementById('rpt-collection-pct').textContent = pct + '%';
  document.getElementById('rpt-bar').style.width            = pct + '%';
  document.getElementById('rpt-bar').className              = 'progress-bar ' + (pct>=80?'green':pct>=50?'orange':'red');

  // by method
  const methods = {};
  payments.forEach(p => {
    if (p.method) methods[p.method] = (methods[p.method]||0) + p.paidAmount;
  });

  const methodEl = document.getElementById('rpt-by-method');
  methodEl.innerHTML = Object.entries(methods).length
    ? Object.entries(methods).map(([m, v]) =>
        `<div class="flex justify-between items-center" style="padding:8px 0;border-bottom:1px solid var(--border)">
          <span>${m}</span><span class="fw-bold">${fmtCurrency(v)}</span>
        </div>`).join('')
    : `<p class="text-muted">No data.</p>`;
}

// ── Defaulters ───────────────────────────────────────────────
function renderDefaulterReport() {
  const payments = DB.Payments.all().filter(p => p.status !== 'Paid');
  const students = DB.Students.all();
  const courses  = DB.Courses.all();

  const tbody = document.getElementById('defaulters-tbody');
  if (!payments.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:24px">
      🎉 No pending or partial payments!
    </td></tr>`;
    return;
  }

  tbody.innerHTML = payments.map(p => {
    const s = students.find(st => st.id === p.studentId);
    const c = s ? courses.find(co => co.id === s.courseId) : null;
    const balance = p.amount - p.paidAmount;
    return `<tr>
      <td>${s ? s.name : '—'}<br><small class="text-muted">${s ? s.rollNo : ''}</small></td>
      <td>${c ? c.name : '—'}<br><small class="text-muted">${s ? 'Year '+s.year : ''}</small></td>
      <td>${fmtCurrency(p.amount)}</td>
      <td>${fmtCurrency(p.paidAmount)}</td>
      <td class="text-danger fw-bold">${fmtCurrency(balance)}</td>
      <td>${statusBadge(p.status)}</td>
    </tr>`;
  }).join('');
}

// ── Course-wise report ───────────────────────────────────────
function renderCourseWiseReport() {
  const courses  = DB.Courses.all();
  const students = DB.Students.all();
  const payments = DB.Payments.all();

  const tbody = document.getElementById('coursewise-tbody');
  tbody.innerHTML = courses.map(c => {
    const courseStudents = students.filter(s => s.courseId === c.id);
    const studentIds     = courseStudents.map(s => s.id);
    const coursePayments = payments.filter(p => studentIds.includes(p.studentId));
    const totalDue       = coursePayments.reduce((s,p) => s + p.amount, 0);
    const totalCollected = coursePayments.reduce((s,p) => s + p.paidAmount, 0);
    const pct            = totalDue ? Math.round((totalCollected/totalDue)*100) : 0;

    return `<tr>
      <td class="fw-bold">${c.name}</td>
      <td>${c.department}</td>
      <td>${courseStudents.length}</td>
      <td>${fmtCurrency(totalDue)}</td>
      <td class="text-success fw-bold">${fmtCurrency(totalCollected)}</td>
      <td class="text-danger">${fmtCurrency(totalDue-totalCollected)}</td>
      <td>
        <div class="flex items-center gap-2">
          <div class="progress" style="flex:1;height:6px">
            <div class="progress-bar ${pct>=80?'green':pct>=50?'orange':'red'}" style="width:${pct}%"></div>
          </div>
          <span style="font-size:.78rem;min-width:36px">${pct}%</span>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── Export CSV ───────────────────────────────────────────────
function exportPaymentsCSV() {
  const payments = DB.Payments.all();
  const students = DB.Students.all();
  const courses  = DB.Courses.all();

  const rows = [
    ['Receipt No','Student Name','Roll No','Course','Year','Fee Amount','Paid Amount','Balance','Payment Date','Method','Status','Remarks']
  ];

  payments.forEach(p => {
    const s = students.find(st => st.id === p.studentId);
    const c = s ? courses.find(co => co.id === s.courseId) : null;
    rows.push([
      p.receiptNo,
      s ? s.name : '',
      s ? s.rollNo : '',
      c ? c.name : '',
      s ? s.year : '',
      p.amount,
      p.paidAmount,
      p.amount - p.paidAmount,
      p.paymentDate,
      p.method,
      p.status,
      p.remark,
    ]);
  });

  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `fee-payments-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast('CSV exported!', 'success');
}

function exportStudentsCSV() {
  const students = DB.Students.all();
  const courses  = DB.Courses.all();

  const rows = [['Roll No','Name','Email','Phone','Course','Year','Status','Admission Date','Gender','Address']];
  students.forEach(s => {
    const c = courses.find(co => co.id === s.courseId);
    rows.push([s.rollNo,s.name,s.email,s.phone,c?c.name:'',s.year,s.status,s.admissionDate,s.gender,s.address]);
  });

  const csv = rows.map(r => r.map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `students-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Students CSV exported!', 'success');
}
