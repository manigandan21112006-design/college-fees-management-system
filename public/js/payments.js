// ============================================================
//  Payments Page
// ============================================================

let paymentFilterStatus = 'all';
let editPaymentId = null;

function renderPayments() {
  const payments  = DB.Payments.all();
  const students  = DB.Students.all();
  const courses   = DB.Courses.all();

  const filtered = paymentFilterStatus === 'all'
    ? payments
    : payments.filter(p => p.status === paymentFilterStatus);

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
  const s  = DB.Students.get(p.studentId);
  const c  = s ? DB.Courses.get(s.courseId) : null;

  const win = window.open('', '_blank', 'width=600,height=700');
  win.document.write(`<!DOCTYPE html>
<html><head><title>Fee Receipt</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; padding: 32px; color: #1e293b; }
  .header { text-align:center; border-bottom:2px solid #2563eb; padding-bottom:16px; margin-bottom:20px; }
  .header h1 { color: #2563eb; font-size:1.4rem; }
  .header p { color:#64748b; font-size:.85rem; }
  .receipt-no { text-align:right; font-size:.85rem; color:#64748b; margin-bottom:20px; }
  table { width:100%; border-collapse:collapse; }
  td { padding:8px 0; font-size:.9rem; }
  td:first-child { color:#64748b; width:40%; }
  td:last-child { font-weight:600; }
  .total-row td { border-top:2px solid #2563eb; padding-top:12px; font-size:1rem; color:#2563eb; }
  .footer { margin-top:40px; text-align:center; font-size:.8rem; color:#94a3b8; }
  .stamp { margin-top:40px; display:flex; justify-content:space-between; }
  .stamp div { text-align:center; font-size:.8rem; color:#64748b; }
  .stamp div p { margin-top:40px; border-top:1px solid #cbd5e1; padding-top:6px; }
</style></head>
<body>
  <div class="header">
    <h1>🎓 College Fees Management</h1>
    <p>Official Fee Receipt</p>
  </div>
  <div class="receipt-no">Receipt No: <strong>${p.receiptNo || '—'}</strong></div>
  <table>
    <tr><td>Student Name</td><td>${s ? s.name : '—'}</td></tr>
    <tr><td>Roll No</td><td>${s ? s.rollNo : '—'}</td></tr>
    <tr><td>Course</td><td>${c ? c.name : '—'}</td></tr>
    <tr><td>Year</td><td>${s ? 'Year ' + s.year : '—'}</td></tr>
    <tr><td>Payment Date</td><td>${fmtDate(p.paymentDate)}</td></tr>
    <tr><td>Payment Method</td><td>${p.method || '—'}</td></tr>
    <tr><td>Remarks</td><td>${p.remark || '—'}</td></tr>
    <tr><td colspan="2" style="padding:8px 0">&nbsp;</td></tr>
    <tr><td>Fee Amount</td><td>${fmtCurrency(p.amount)}</td></tr>
    <tr><td>Amount Paid</td><td>${fmtCurrency(p.paidAmount)}</td></tr>
    <tr class="total-row"><td>Balance Due</td><td>${fmtCurrency(p.amount - p.paidAmount)}</td></tr>
  </table>
  <div class="stamp">
    <div><p>Student Signature</p></div>
    <div><p>Accounts Officer</p></div>
    <div><p>Principal</p></div>
  </div>
  <div class="footer">This is a computer-generated receipt and does not require a physical signature.</div>
  <script>window.onload = () => { window.print(); }<\/script>
</body></html>`);
  win.document.close();
}

// ── Filter buttons ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.pay-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      paymentFilterStatus = btn.dataset.status;
      renderPayments();
    });
  });

  const studentSel = document.getElementById('payment-student');
  if (studentSel) studentSel.addEventListener('change', onPaymentStudentChange);
});
