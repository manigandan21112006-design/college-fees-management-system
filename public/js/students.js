// ============================================================
//  Students Page
// ============================================================

let studentSearchQuery = '';
let editStudentId = null;

function renderStudents() {
  const all = DB.Students.all();
  const courses = DB.Courses.all();
  const query = studentSearchQuery.toLowerCase();

  const filtered = query
    ? all.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.rollNo.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query))
    : all;

  const tbody = document.getElementById('students-tbody');

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7">
      <div class="empty-state">
        <div class="empty-icon">🎓</div>
        <h3>No students found</h3>
        <p>Try a different search or add a new student.</p>
      </div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const course = courses.find(c => c.id === s.courseId);
    const payments = DB.Payments.byStudent(s.id);
    const paid    = payments.reduce((sum, p) => sum + p.paidAmount, 0);
    const due     = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = due - paid;
    return `<tr>
      <td>
        <div class="flex items-center gap-2">
          <div style="width:34px;height:34px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;flex-shrink:0">
            ${s.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <div>
            <div style="font-weight:600">${s.name}</div>
            <div class="text-muted" style="font-size:.75rem">${s.rollNo}</div>
          </div>
        </div>
      </td>
      <td>${course ? course.name : '—'}<br><small class="text-muted">Year ${s.year}</small></td>
      <td>${s.email}<br><small class="text-muted">${s.phone}</small></td>
      <td>${fmtDate(s.admissionDate)}</td>
      <td>
        <div>${fmtCurrency(paid)}</div>
        ${balance > 0 ? `<div style="font-size:.75rem;color:var(--danger)">Balance: ${fmtCurrency(balance)}</div>` : ''}
      </td>
      <td>${statusBadge(s.status)}</td>
      <td>
        <div class="flex gap-2">
          <button class="btn btn-outline btn-sm" onclick="openViewStudent(${s.id})">View</button>
          <button class="btn btn-primary btn-sm" onclick="openEditStudent(${s.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id})">Del</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  // populate course dropdowns in modal
  populateCourseDropdowns();
}

function populateCourseDropdowns() {
  const courses = DB.Courses.all();
  ['student-course', 'view-course'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value="">Select Course</option>' +
      courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  });
}

// ── Add / Edit student ───────────────────────────────────────
function openAddStudent() {
  editStudentId = null;
  document.getElementById('student-modal-title').textContent = 'Add New Student';
  document.getElementById('student-form').reset();
  populateCourseDropdowns();
  openModal('student-modal');
}

function openEditStudent(id) {
  const s = DB.Students.get(id);
  if (!s) return;
  editStudentId = id;
  document.getElementById('student-modal-title').textContent = 'Edit Student';
  populateCourseDropdowns();

  // fill fields
  document.getElementById('student-name').value        = s.name;
  document.getElementById('student-roll').value        = s.rollNo;
  document.getElementById('student-email').value       = s.email;
  document.getElementById('student-phone').value       = s.phone;
  document.getElementById('student-dob').value         = s.dob;
  document.getElementById('student-gender').value      = s.gender;
  document.getElementById('student-address').value     = s.address;
  document.getElementById('student-course').value      = s.courseId;
  document.getElementById('student-year').value        = s.year;
  document.getElementById('student-status').value      = s.status;
  document.getElementById('student-admission').value   = s.admissionDate;
  openModal('student-modal');
}

function saveStudent() {
  const data = {
    name:          document.getElementById('student-name').value.trim(),
    rollNo:        document.getElementById('student-roll').value.trim(),
    email:         document.getElementById('student-email').value.trim(),
    phone:         document.getElementById('student-phone').value.trim(),
    dob:           document.getElementById('student-dob').value,
    gender:        document.getElementById('student-gender').value,
    address:       document.getElementById('student-address').value.trim(),
    courseId:      parseInt(document.getElementById('student-course').value),
    year:          parseInt(document.getElementById('student-year').value),
    status:        document.getElementById('student-status').value,
    admissionDate: document.getElementById('student-admission').value,
  };

  if (!data.name || !data.rollNo || !data.courseId) {
    toast('Please fill in Name, Roll No, and Course.', 'error');
    return;
  }

  if (editStudentId) {
    DB.Students.update(editStudentId, data);
    toast('Student updated successfully!', 'success');
  } else {
    DB.Students.add(data);
    toast('Student added successfully!', 'success');
  }

  closeModal('student-modal');
  renderStudents();
}

// ── View student detail ──────────────────────────────────────
function openViewStudent(id) {
  const s = DB.Students.get(id);
  if (!s) return;
  const course  = DB.Courses.get(s.courseId);
  const payments = DB.Payments.byStudent(id);
  const paid    = payments.reduce((sum, p) => sum + p.paidAmount, 0);
  const due     = payments.reduce((sum, p) => sum + p.amount, 0);

  document.getElementById('view-student-info').innerHTML = `
    <div class="form-grid">
      <div><label>Name</label><p class="fw-bold">${s.name}</p></div>
      <div><label>Roll No</label><p>${s.rollNo}</p></div>
      <div><label>Email</label><p>${s.email}</p></div>
      <div><label>Phone</label><p>${s.phone}</p></div>
      <div><label>Course</label><p>${course ? course.name : '—'}</p></div>
      <div><label>Year</label><p>Year ${s.year}</p></div>
      <div><label>Admission Date</label><p>${fmtDate(s.admissionDate)}</p></div>
      <div><label>Status</label><p>${statusBadge(s.status)}</p></div>
      <div><label>Total Due</label><p class="fw-bold">${fmtCurrency(due)}</p></div>
      <div><label>Total Paid</label><p class="fw-bold text-success">${fmtCurrency(paid)}</p></div>
      <div><label>Balance</label><p class="fw-bold ${due-paid > 0 ? 'text-danger' : 'text-success'}">${fmtCurrency(due - paid)}</p></div>
      <div><label>Gender</label><p>${s.gender}</p></div>
    </div>
    <hr style="margin:16px 0;border:none;border-top:1px solid var(--border)">
    <h4 style="margin-bottom:12px;font-size:.9rem">Payment History</h4>
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Receipt</th><th>Amount Due</th><th>Paid</th><th>Date</th><th>Method</th><th>Status</th>
        </tr></thead>
        <tbody>
          ${payments.length ? payments.map(p => `<tr>
            <td>${p.receiptNo || '—'}</td>
            <td>${fmtCurrency(p.amount)}</td>
            <td>${fmtCurrency(p.paidAmount)}</td>
            <td>${fmtDate(p.paymentDate)}</td>
            <td>${p.method || '—'}</td>
            <td>${statusBadge(p.status)}</td>
          </tr>`).join('') : `<tr><td colspan="6" class="text-center text-muted">No payments</td></tr>`}
        </tbody>
      </table>
    </div>`;

  openModal('view-student-modal');
}

// ── Delete ───────────────────────────────────────────────────
function deleteStudent(id) {
  if (!confirmAction('Are you sure you want to delete this student? All related payments will also be removed.')) return;
  DB.Students.delete(id);
  DB.Payments.all().filter(p => p.studentId === id).forEach(p => DB.Payments.delete(p.id));
  toast('Student deleted.', 'info');
  renderStudents();
}

// ── Search ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('student-search');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      studentSearchQuery = e.target.value;
      renderStudents();
    });
  }
});
