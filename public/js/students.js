// ============================================================
//  Students Page
// ============================================================

let studentSearchQuery = '';
let editStudentId = null;

function renderStudents() {
  const all     = DB.Students.all();
  const courses = DB.Courses.all();
  const query   = studentSearchQuery.toLowerCase();

  const filtered = query
    ? all.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.rollNo.toLowerCase().includes(query) ||
        (s.email||'').toLowerCase().includes(query))
    : all;

  const tbody = document.getElementById('students-tbody');

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="8">
      <div class="empty-state">
        <div class="empty-icon">🎓</div>
        <h3>No students found</h3>
        <p>Try a different search or add a new student.</p>
      </div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const course   = courses.find(c => c.id === s.courseId);
    const payments = DB.Payments.byStudent(s.id);
    const paid     = payments.reduce((sum, p) => sum + p.paidAmount, 0);
    const feeStr   = DB.FeeStructures.byCourseYear(s.courseId, s.year);
    const due      = feeStr ? feeStr.total : payments.reduce((sum, p) => sum + p.amount, 0);
    const balance  = due - paid;

    // Dynamically resolve fee structure for this student
    const fs = DB.FeeStructures.byCourseYear(s.courseId, s.year);

    return `<tr>
      <td>
        <div class="flex items-center gap-2">
          <div style="width:34px;height:34px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;flex-shrink:0">
            ${s.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <div style="font-weight:600">${s.name}</div>
        </div>
      </td>
      <td><span class="badge badge-secondary" style="font-size:.8rem;font-weight:700;letter-spacing:.3px">${s.rollNo}</span></td>
      <td>
        ${course ? `<div>${course.name}</div><small class="text-muted">${course.department} · Year ${s.year}</small>` : '—'}
      </td>
      <td>${s.email||'—'}<br><small class="text-muted">${s.phone||''}</small></td>
      <td>${fmtDate(s.admissionDate)}</td>
      <td>
        <div class="fw-bold">${fmtCurrency(paid)}</div>
        ${due > 0 ? `<small class="text-muted">of ${fmtCurrency(due)}</small>` : ''}
        ${balance > 0 ? `<div style="font-size:.75rem;color:var(--danger)">Balance: ${fmtCurrency(balance)}</div>` : ''}
        ${!fs ? `<div style="font-size:.7rem;color:#d97706">⚠ No fee structure</div>` : ''}
      </td>
      <td>${statusBadge(s.status)}</td>
      <td>
        <div class="flex gap-2">
          <button class="btn btn-outline btn-sm" onclick="openViewStudent(${s.id})">View</button>
          <button class="btn btn-primary btn-sm" onclick="openEditStudent(${s.id})">Edit</button>
          <button class="btn btn-danger btn-sm"  onclick="deleteStudent(${s.id})">Del</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  populateCourseDropdowns();
}

function populateCourseDropdowns() {
  const courses = DB.Courses.all();
  ['student-course'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value="">Select Course</option>' +
      courses.map(c => `<option value="${c.id}">${c.name} (${c.department})</option>`).join('');
  });
}

// ── Fee preview — called when course or year changes in modal ─
function onStudentCourseYearChange() {
  const courseId = parseInt(document.getElementById('student-course').value);
  const year     = parseInt(document.getElementById('student-year').value);
  const preview  = document.getElementById('student-fee-preview');
  if (!preview) return;

  if (!courseId || !year) {
    preview.innerHTML = '';
    return;
  }

  const fs     = DB.FeeStructures.byCourseYear(courseId, year);
  const course = DB.Courses.get(courseId);

  if (!fs) {
    preview.innerHTML = `
      <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:10px 14px;font-size:.8rem;color:#92400e;margin-top:8px">
        ⚠️ No fee structure defined for <strong>${course ? course.name : ''} · Year ${year}</strong>.
        Go to <strong>Fee Structure</strong> page to add it first.
      </div>`;
    return;
  }

  preview.innerHTML = `
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:12px 14px;margin-top:10px">
      <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#15803d;margin-bottom:8px">
        📋 Mapped Fee Structure — ${course ? course.name : ''} · Year ${year}
      </div>
      <div style="display:grid;grid-template-columns:1fr auto;gap:3px 12px;font-size:.82rem;color:#374151">
        <span>Tuition Fee</span>  <span style="font-weight:600;text-align:right">₹${Number(fs.tuitionFee).toLocaleString('en-IN')}</span>
        <span>Exam Fee</span>     <span style="font-weight:600;text-align:right">₹${Number(fs.examFee).toLocaleString('en-IN')}</span>
        <span>Library Fee</span>  <span style="font-weight:600;text-align:right">₹${Number(fs.libraryFee).toLocaleString('en-IN')}</span>
        <span>Lab Fee</span>      <span style="font-weight:600;text-align:right">₹${Number(fs.labFee).toLocaleString('en-IN')}</span>
        <span>Other Fee</span>    <span style="font-weight:600;text-align:right">₹${Number(fs.otherFee).toLocaleString('en-IN')}</span>
      </div>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #86efac;display:flex;justify-content:space-between;font-weight:800;font-size:.9rem;color:#15803d">
        <span>Total Annual Fee</span><span>₹${Number(fs.total).toLocaleString('en-IN')}</span>
      </div>
      <div style="margin-top:6px;font-size:.72rem;color:#64748b">
        🔑 Student can login using <strong>Roll No</strong> + <strong>Date of Birth</strong> once saved.
      </div>
    </div>`;
}

// ── Add / Edit student ────────────────────────────────────────
function openAddStudent() {
  editStudentId = null;
  document.getElementById('student-modal-title').textContent = 'Add New Student';
  document.getElementById('student-form').reset();
  // Auto-fill today as admission date
  document.getElementById('student-admission').value = new Date().toISOString().slice(0, 10);
  populateCourseDropdowns();
  const preview = document.getElementById('student-fee-preview');
  if (preview) preview.innerHTML = '';
  openModal('student-modal');
}

function openEditStudent(id) {
  const s = DB.Students.get(id);
  if (!s) return;
  editStudentId = id;
  document.getElementById('student-modal-title').textContent = 'Edit Student';
  populateCourseDropdowns();

  document.getElementById('student-name').value      = s.name;
  document.getElementById('student-roll').value      = s.rollNo;
  document.getElementById('student-email').value     = s.email;
  document.getElementById('student-phone').value     = s.phone;
  document.getElementById('student-dob').value       = s.dob;
  document.getElementById('student-gender').value    = s.gender;
  document.getElementById('student-address').value   = s.address;
  document.getElementById('student-course').value    = s.courseId;
  document.getElementById('student-year').value      = s.year;
  document.getElementById('student-status').value    = s.status;
  document.getElementById('student-admission').value = s.admissionDate;

  // Show fee preview for current mapping
  onStudentCourseYearChange();
  openModal('student-modal');
}

async function saveStudent() {
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
  if (!data.dob) {
    toast('Please enter Date of Birth — it is used as the student login password.', 'error');
    return;
  }

  // Warn if no fee structure exists for this course+year
  const fs = DB.FeeStructures.byCourseYear(data.courseId, data.year);
  if (!fs) {
    const proceed = confirmAction(
      `No fee structure exists for this course/year. The student can still be saved but payments cannot be recorded until a fee structure is added. Continue?`
    );
    if (!proceed) return;
  }

  try {
    if (editStudentId) {
      await DB.Students.update(editStudentId, data);
      toast(`Student "${data.name}" updated! They can now login with Roll No + DOB.`, 'success');
    } else {
      await DB.Students.add(data);
      toast(`Student "${data.name}" added! They can login with Roll No: ${data.rollNo} + Date of Birth.`, 'success');
    }
    closeModal('student-modal');
    renderStudents();
  } catch(e) {
    if (e.message.includes('23505')) {
      toast(`Roll Number "${data.rollNo}" already exists. Please use a unique roll number.`, 'error');
    } else {
      toast('Error saving student: ' + e.message, 'error');
    }
  }
}

// ── View student detail ───────────────────────────────────────
function openViewStudent(id) {
  const s       = DB.Students.get(id);
  if (!s) return;
  const course   = DB.Courses.get(s.courseId);
  const payments = DB.Payments.byStudent(id);
  const fs       = DB.FeeStructures.byCourseYear(s.courseId, s.year);
  const paid     = payments.reduce((sum, p) => sum + p.paidAmount, 0);
  // Due = fee structure total — NOT payment records (would be 0 with no payments)
  const due      = fs ? fs.total : payments.reduce((sum, p) => sum + p.amount, 0);
  const balance  = due - paid;
  const subjects = DB.CourseSubjects.byCourseYear(s.courseId, s.year);

  document.getElementById('view-student-info').innerHTML = `
    <div class="form-grid">
      <div><label>Name</label><p class="fw-bold">${s.name}</p></div>
      <div><label>Roll No</label><p>${s.rollNo}</p></div>
      <div><label>Email</label><p>${s.email||'—'}</p></div>
      <div><label>Phone</label><p>${s.phone||'—'}</p></div>
      <div><label>Course</label><p>${course ? course.name : '—'}</p></div>
      <div><label>Department</label><p>${course ? course.department : '—'}</p></div>
      <div><label>Year</label><p>Year ${s.year}</p></div>
      <div><label>Admission Date</label><p>${fmtDate(s.admissionDate)}</p></div>
      <div><label>Date of Birth</label><p>${fmtDate(s.dob)} <small style="color:#64748b">(login password)</small></p></div>
      <div><label>Status</label><p>${statusBadge(s.status)}</p></div>
      <div><label>Gender</label><p>${s.gender||'—'}</p></div>
      <div><label>Address</label><p>${s.address||'—'}</p></div>
    </div>

    ${fs ? `
    <hr style="margin:14px 0;border:none;border-top:1px solid var(--border)">
    <h4 style="margin-bottom:10px;font-size:.88rem;color:#15803d">💰 Mapped Fee Structure (${course?course.name:''} · Year ${s.year})</h4>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
      ${[['Tuition',fs.tuitionFee],['Exam',fs.examFee],['Library',fs.libraryFee],['Lab',fs.labFee],['Other',fs.otherFee],['Total',fs.total]]
        .map(([l,v])=>`<div style="background:#f8fafc;border-radius:8px;padding:8px 10px;font-size:.8rem"><div style="color:#64748b">${l}</div><div style="font-weight:700">${fmtCurrency(v)}</div></div>`).join('')}
    </div>` : `
    <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:10px;font-size:.82rem;color:#92400e;margin:12px 0">
      ⚠️ No fee structure mapped for this course/year.
    </div>`}

    ${subjects.length ? `
    <h4 style="margin-bottom:8px;font-size:.88rem;color:#1d4ed8">📚 Subjects (${subjects.length})</h4>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
      ${subjects.map(sub=>`<span style="background:#eff6ff;color:#1d4ed8;padding:3px 10px;border-radius:20px;font-size:.78rem;font-weight:600">${sub.code} — ${sub.name}</span>`).join('')}
    </div>` : ''}

    <hr style="margin:14px 0;border:none;border-top:1px solid var(--border)">
    <div style="display:flex;justify-content:space-between;margin-bottom:10px">
      <h4 style="font-size:.88rem">💳 Payment History</h4>
      <div style="font-size:.82rem">
        Paid: <strong style="color:#16a34a">${fmtCurrency(paid)}</strong> /
        Due: <strong>${fmtCurrency(due)}</strong>
        ${balance > 0 ? `· <strong style="color:#dc2626">Balance: ${fmtCurrency(balance)}</strong>` : ' · <span style="color:#16a34a">✅ Fully Paid</span>'}
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Receipt</th><th>Amount Due</th><th>Paid</th><th>Date</th><th>Method</th><th>Status</th></tr></thead>
        <tbody>
          ${payments.length ? payments.map(p => `<tr>
            <td>${p.receiptNo||'—'}</td>
            <td>${fmtCurrency(p.amount)}</td>
            <td>${fmtCurrency(p.paidAmount)}</td>
            <td>${fmtDate(p.paymentDate)}</td>
            <td>${p.method||'—'}</td>
            <td>${statusBadge(p.status)}</td>
          </tr>`).join('') : `<tr><td colspan="6" class="text-center text-muted">No payments yet</td></tr>`}
        </tbody>
      </table>
    </div>`;

  openModal('view-student-modal');
}

async function deleteStudent(id) {
  if (!confirmAction('Delete this student? All their payments will also be removed.')) return;
  try {
    await DB.Students.delete(id);
    // payments cascade delete in DB, but also clean local cache
    _cache && (_cache.payments = _cache.payments ? _cache.payments.filter(p => p.studentId !== id) : []);
    toast('Student deleted.', 'info');
    renderStudents();
  } catch(e) { toast('Error: ' + e.message, 'error'); }
}

// ── Search ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('student-search');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      studentSearchQuery = e.target.value;
      renderStudents();
    });
  }

  // Wire fee preview on course/year change in the Add/Edit modal
  const courseSel = document.getElementById('student-course');
  const yearSel   = document.getElementById('student-year');
  if (courseSel) courseSel.addEventListener('change', onStudentCourseYearChange);
  if (yearSel)   yearSel.addEventListener('change',   onStudentCourseYearChange);
});
