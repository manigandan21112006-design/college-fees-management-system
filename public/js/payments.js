// ============================================================
//  Payments Page
// ============================================================

let paymentFilterStatus = 'all';
let paymentSearchQuery  = '';
let editPaymentId = null;

function renderPayments() {
  const payments  = DB.Payments.all();
  const students  = DB.Students.all();
  const courses   = DB.Courses.all();

  const q = paymentSearchQuery.toLowerCase().trim();

  const filtered = payments.filter(p => {
    // status filter
    if (paymentFilterStatus !== 'all' && p.status !== paymentFilterStatus) return false;
    // search filter
    if (q) {
      const s = students.find(st => st.id === p.studentId);
      const c = s ? courses.find(co => co.id === s.courseId) : null;
      const haystack = [
        p.receiptNo,
        s ? s.name : '',
        s ? s.rollNo : '',
        c ? c.name : '',
        p.method,
        p.status,
        p.remark,
      ].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const tbody = document.getElementById('payments-tbody');

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="8">
      <div class="empty-state">
        <div class="empty-icon">💳</div>
        <h3>No payments found</h3>
        <p>Add a payment record to get started.</p>
      </div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const s  = students.find(st => st.id === p.studentId);
    const c  = s ? courses.find(co => co.id === s.courseId) : null;
    const balance = p.amount - p.paidAmount;
    return `<tr>
      <td>${p.receiptNo || '—'}</td>
      <td>
        <div class="fw-bold">${s ? s.name : '—'}</div>
        <div class="text-muted" style="font-size:.75rem">${s ? s.rollNo : ''}</div>
      </td>
      <td>${c ? c.name : '—'}<br><small class="text-muted">${s ? 'Year ' + s.year : ''}</small></td>
      <td>${fmtCurrency(p.amount)}</td>
      <td class="text-success fw-bold">${fmtCurrency(p.paidAmount)}</td>
      <td class="${balance > 0 ? 'text-danger' : 'text-success'}">${fmtCurrency(balance)}</td>
      <td>${fmtDate(p.paymentDate)}<br><small class="text-muted">${p.method || ''}</small></td>
      <td>${statusBadge(p.status)}</td>
      <td>
        <div class="flex gap-2">
          <button class="btn btn-outline btn-sm" onclick="printReceipt(${p.id})">🖨️</button>
          <button class="btn btn-primary btn-sm" onclick="openEditPayment(${p.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deletePayment(${p.id})">Del</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  // update filter button active states
  document.querySelectorAll('.pay-filter-btn').forEach(btn => {
    btn.classList.toggle('btn-primary', btn.dataset.status === paymentFilterStatus);
    btn.classList.toggle('btn-outline',  btn.dataset.status !== paymentFilterStatus);
  });
}

// ── Add / Edit ───────────────────────────────────────────────
function openAddPayment() {
  editPaymentId = null;
  document.getElementById('payment-modal-title').textContent = 'Record New Payment';
  document.getElementById('payment-form').reset();
  document.getElementById('payment-date').value = new Date().toISOString().slice(0,10);

  // populate student dropdown
  populatePaymentStudentDropdown();
  generateReceiptNo();
  openModal('payment-modal');
}

function openEditPayment(id) {
  const p = DB.Payments.get(id);
  if (!p) return;
  editPaymentId = id;
  document.getElementById('payment-modal-title').textContent = 'Edit Payment';
  populatePaymentStudentDropdown();

  document.getElementById('payment-student').value   = p.studentId;
  document.getElementById('payment-amount').value    = p.amount;
  document.getElementById('payment-paid').value      = p.paidAmount;
  document.getElementById('payment-date').value      = p.paymentDate;
  document.getElementById('payment-method').value    = p.method;
  document.getElementById('payment-receipt').value   = p.receiptNo;
  document.getElementById('payment-remark').value    = p.remark;
  document.getElementById('payment-status').value    = p.status;

  onPaymentStudentChange();
  openModal('payment-modal');
}

function populatePaymentStudentDropdown() {
  const students = DB.Students.all().filter(s => s.status === 'Active');
  const sel = document.getElementById('payment-student');
  sel.innerHTML = '<option value="">Select Student</option>' +
    students.map(s => `<option value="${s.id}">${s.name} (${s.rollNo})</option>`).join('');
}

function onPaymentStudentChange() {
  const studentId = parseInt(document.getElementById('payment-student').value);
  if (!studentId) return;
  const s = DB.Students.get(studentId);
  if (!s) return;
  const fs = DB.FeeStructures.byCourseYear(s.courseId, s.year);
  if (fs && !editPaymentId) {
    document.getElementById('payment-amount').value = fs.total;
  }
}

function generateReceiptNo() {
  const payments = DB.Payments.all();
  const num = payments.length + 1;
  document.getElementById('payment-receipt').value = 'RCP' + String(num).padStart(3, '0');
}

function savePayment() {
  const paidAmount = parseFloat(document.getElementById('payment-paid').value) || 0;
  const amount     = parseFloat(document.getElementById('payment-amount').value) || 0;

  let status = 'Pending';
  if (paidAmount >= amount)      status = 'Paid';
  else if (paidAmount > 0)       status = 'Partial';

  const statusOverride = document.getElementById('payment-status').value;
  if (statusOverride) status = statusOverride;

  const data = {
    studentId:   parseInt(document.getElementById('payment-student').value),
    amount,
    paidAmount,
    paymentDate: document.getElementById('payment-date').value,
    method:      document.getElementById('payment-method').value,
    receiptNo:   document.getElementById('payment-receipt').value.trim(),
    remark:      document.getElementById('payment-remark').value.trim(),
    status,
  };

  if (!data.studentId || !data.amount) {
    toast('Please select a student and enter the fee amount.', 'error');
    return;
  }

  if (editPaymentId) {
    DB.Payments.update(editPaymentId, data);
    toast('Payment updated!', 'success');
  } else {
    DB.Payments.add(data);
    toast('Payment recorded!', 'success');
  }
  closeModal('payment-modal');
  renderPayments();
}

function deletePayment(id) {
  if (!confirmAction('Delete this payment record?')) return;
  DB.Payments.delete(id);
  toast('Payment deleted.', 'info');
  renderPayments();
}

// ── Print Receipt ────────────────────────────────────────────
function printReceipt(id) {
  const p = DB.Payments.get(id);
  if (!p) return;
  const s   = DB.Students.get(p.studentId);
  const c   = s ? DB.Courses.get(s.courseId) : null;
  const bal = p.amount - p.paidAmount;

  const statusColor = p.status === 'Paid' ? '#16a34a' : p.status === 'Partial' ? '#d97706' : '#dc2626';
  const statusBg    = p.status === 'Paid' ? '#dcfce7' : p.status === 'Partial' ? '#fef3c7' : '#fee2e2';

  const win = window.open('', '_blank', 'width=680,height=800');
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Fee Receipt — ${p.receiptNo || 'N/A'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #f1f5f9;
      display: flex;
      justify-content: center;
      padding: 30px 16px;
      color: #1e293b;
    }
    .receipt {
      background: #fff;
      width: 600px;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,.1);
      overflow: hidden;
    }

    /* ── Header band ── */
    .receipt-header {
      background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%);
      color: #fff;
      padding: 28px 32px 20px;
      position: relative;
    }
    .receipt-header .college-name {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: .3px;
    }
    .receipt-header .college-sub {
      font-size: .82rem;
      opacity: .85;
      margin-top: 2px;
    }
    .receipt-header .receipt-label {
      position: absolute;
      top: 28px; right: 32px;
      text-align: right;
    }
    .receipt-header .receipt-label span {
      display: block;
      font-size: .72rem;
      opacity: .75;
      text-transform: uppercase;
      letter-spacing: .8px;
    }
    .receipt-header .receipt-label strong {
      font-size: 1.1rem;
      letter-spacing: .5px;
    }

    /* ── Status ribbon ── */
    .status-ribbon {
      background: ${statusBg};
      color: ${statusColor};
      text-align: center;
      font-size: .78rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 7px;
      border-bottom: 1px solid ${statusColor}33;
    }

    /* ── Body ── */
    .receipt-body { padding: 28px 32px; }

    .section-title {
      font-size: .7rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 22px;
    }
    .info-cell {
      padding: 11px 14px;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
    }
    .info-cell:nth-child(even) { border-right: none; }
    .info-cell:nth-last-child(-n+2) { border-bottom: none; }
    .info-cell .label {
      font-size: .7rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: .6px;
      margin-bottom: 3px;
    }
    .info-cell .value {
      font-size: .88rem;
      font-weight: 600;
      color: #1e293b;
    }

    /* ── Fee breakdown ── */
    .fee-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 22px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .fee-table thead tr {
      background: #f8fafc;
    }
    .fee-table th {
      padding: 9px 14px;
      font-size: .72rem;
      text-transform: uppercase;
      letter-spacing: .6px;
      color: #64748b;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .fee-table th:last-child, .fee-table td:last-child { text-align: right; }
    .fee-table td {
      padding: 10px 14px;
      font-size: .88rem;
      color: #334155;
      border-bottom: 1px solid #f1f5f9;
    }
    .fee-table tr:last-child td { border-bottom: none; }
    .fee-table .total-row td {
      background: #eff6ff;
      font-weight: 700;
      font-size: .95rem;
      color: #1d4ed8;
      border-top: 2px solid #bfdbfe;
    }
    .fee-table .balance-row td {
      font-weight: 700;
      color: ${bal > 0 ? '#dc2626' : '#16a34a'};
    }

    /* ── Remark ── */
    .remark-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 11px 14px;
      font-size: .83rem;
      color: #475569;
      margin-bottom: 28px;
    }

    /* ── Signature strip ── */
    .sig-strip {
      display: flex;
      justify-content: space-between;
      padding: 0 8px;
      margin-bottom: 28px;
    }
    .sig-box { text-align: center; width: 30%; }
    .sig-line {
      border-top: 1px solid #cbd5e1;
      margin-bottom: 6px;
      margin-top: 44px;
    }
    .sig-box span {
      font-size: .72rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: .6px;
    }

    /* ── Footer ── */
    .receipt-footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      padding: 12px;
      font-size: .72rem;
      color: #94a3b8;
      letter-spacing: .3px;
    }

    @media print {
      body { background: #fff; padding: 0; }
      .receipt { box-shadow: none; border-radius: 0; width: 100%; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
<div class="receipt">

  <!-- Header -->
  <div class="receipt-header">
    <div class="college-name">🎓 Shanmuga Industries Arts and Science College</div>
    <div class="college-sub">Official Fee Payment Receipt</div>
    <div class="receipt-label">
      <span>Receipt No.</span>
      <strong>${p.receiptNo || '—'}</strong>
    </div>
  </div>

  <!-- Status -->
  <div class="status-ribbon">Payment Status: ${p.status || '—'}</div>

  <div class="receipt-body">

    <!-- Student info -->
    <div class="section-title">Student Information</div>
    <div class="info-grid">
      <div class="info-cell">
        <div class="label">Student Name</div>
        <div class="value">${s ? s.name : '—'}</div>
      </div>
      <div class="info-cell">
        <div class="label">Roll Number</div>
        <div class="value">${s ? s.rollNo : '—'}</div>
      </div>
      <div class="info-cell">
        <div class="label">Course</div>
        <div class="value">${c ? c.name : '—'}</div>
      </div>
      <div class="info-cell">
        <div class="label">Year of Study</div>
        <div class="value">${s ? 'Year ' + s.year : '—'}</div>
      </div>
      <div class="info-cell">
        <div class="label">Payment Date</div>
        <div class="value">${fmtDate(p.paymentDate)}</div>
      </div>
      <div class="info-cell">
        <div class="label">Payment Method</div>
        <div class="value">${p.method || '—'}</div>
      </div>
    </div>

    <!-- Fee breakdown -->
    <div class="section-title">Fee Details</div>
    <table class="fee-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Total Fee Amount</td>
          <td>${fmtCurrency(p.amount)}</td>
        </tr>
        <tr class="total-row">
          <td>Amount Paid</td>
          <td>${fmtCurrency(p.paidAmount)}</td>
        </tr>
        <tr class="balance-row">
          <td>Balance Due</td>
          <td>${fmtCurrency(bal)}</td>
        </tr>
      </tbody>
    </table>

    ${p.remark ? `
    <!-- Remarks -->
    <div class="section-title">Remarks</div>
    <div class="remark-box">${p.remark}</div>
    ` : ''}

    <!-- Signatures -->
    <div class="sig-strip">
      <div class="sig-box">
        <div class="sig-line"></div>
        <span>Student Signature</span>
      </div>
      <div class="sig-box">
        <div class="sig-line"></div>
        <span>Accounts Officer</span>
      </div>
      <div class="sig-box">
        <div class="sig-line"></div>
        <span>Principal</span>
      </div>
    </div>

  </div><!-- /receipt-body -->

  <div class="receipt-footer">
    This is a computer-generated receipt. Generated on ${new Date().toLocaleString('en-IN')}
  </div>

</div>
<script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`);
  win.document.close();
}

// ── Filter buttons & search ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.pay-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      paymentFilterStatus = btn.dataset.status;
      renderPayments();
    });
  });

  const searchInput = document.getElementById('payment-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      paymentSearchQuery = searchInput.value;
      renderPayments();
    });
  }

  const studentSel = document.getElementById('payment-student');
  if (studentSel) studentSel.addEventListener('change', onPaymentStudentChange);
});
