// ============================================================
//  Fee Structure Page
// ============================================================

let editFeeId  = null;
let editCourseId = null;

function renderFees() {
  const courses      = DB.Courses.all();
  const feeStructures = DB.FeeStructures.all();

  // Course cards
  const courseList = document.getElementById('courses-list');
  courseList.innerHTML = courses.map(c => {
    const fees = feeStructures.filter(f => f.courseId === c.id);
    const years = fees.map(f => f.year).sort((a,b) => a-b);
    return `<div class="card" style="margin-bottom:0">
      <div class="card-header">
        <div>
          <h2>${c.name}</h2>
          <small class="text-muted">${c.department} • ${c.duration}-year program</small>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-outline btn-sm" onclick="openEditCourse(${c.id})">Edit Course</button>
          <button class="btn btn-primary btn-sm" onclick="openAddFeeStructure(${c.id})">+ Add Year Fee</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCourse(${c.id})">Delete</button>
        </div>
      </div>
      ${fees.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Year</th><th>Tuition</th><th>Exam</th><th>Library</th><th>Lab</th><th>Other</th><th class="fw-bold">Total</th><th>Actions</th>
            </tr></thead>
            <tbody>
              ${fees.sort((a,b)=>a.year-b.year).map(f => `<tr>
                <td>Year ${f.year}</td>
                <td>${fmtCurrency(f.tuitionFee)}</td>
                <td>${fmtCurrency(f.examFee)}</td>
                <td>${fmtCurrency(f.libraryFee)}</td>
                <td>${fmtCurrency(f.labFee)}</td>
                <td>${fmtCurrency(f.otherFee)}</td>
                <td class="fw-bold">${fmtCurrency(f.total)}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-outline btn-sm" onclick="openEditFee(${f.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteFee(${f.id})">Del</button>
                  </div>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>` : `<p class="text-muted" style="padding:12px 0">No fee structure defined yet.</p>`}
    </div>`;
  }).join('');

  if (!courses.length) {
    courseList.innerHTML = `<div class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>No courses yet</h3>
      <p>Add your first course to get started.</p>
    </div>`;
  }
}

// ── Course CRUD ──────────────────────────────────────────────
function openAddCourse() {
  editCourseId = null;
  document.getElementById('course-modal-title').textContent = 'Add New Course';
  document.getElementById('course-form').reset();
  openModal('course-modal');
}

function openEditCourse(id) {
  const c = DB.Courses.get(id);
  if (!c) return;
  editCourseId = id;
  document.getElementById('course-modal-title').textContent = 'Edit Course';
  document.getElementById('course-name').value       = c.name;
  document.getElementById('course-dept').value       = c.department;
  document.getElementById('course-duration').value   = c.duration;
  openModal('course-modal');
}

function saveCourse() {
  const data = {
    name:       document.getElementById('course-name').value.trim(),
    department: document.getElementById('course-dept').value.trim(),
    duration:   parseInt(document.getElementById('course-duration').value),
  };
  if (!data.name || !data.department || !data.duration) {
    toast('Please fill all fields.', 'error');
    return;
  }
  if (editCourseId) {
    DB.Courses.update(editCourseId, data);
    toast('Course updated!', 'success');
  } else {
    DB.Courses.add(data);
    toast('Course added!', 'success');
  }
  closeModal('course-modal');
  renderFees();
}

function deleteCourse(id) {
  if (!confirmAction('Delete this course? All fee structures for it will also be removed.')) return;
  DB.Courses.delete(id);
  DB.FeeStructures.all().filter(f => f.courseId === id).forEach(f => DB.FeeStructures.delete(f.id));
  toast('Course deleted.', 'info');
  renderFees();
}

// ── Fee Structure CRUD ───────────────────────────────────────
function openAddFeeStructure(courseId) {
  editFeeId = null;
  document.getElementById('fee-modal-title').textContent = 'Add Fee Structure';
  document.getElementById('fee-form').reset();

  // Populate course select
  const courses = DB.Courses.all();
  const sel = document.getElementById('fee-course');
  sel.innerHTML = courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  if (courseId) sel.value = courseId;

  openModal('fee-modal');
  calcFeeTotal();
}

function openEditFee(id) {
  const f = DB.FeeStructures.get(id);
  if (!f) return;
  editFeeId = id;
  document.getElementById('fee-modal-title').textContent = 'Edit Fee Structure';

  const courses = DB.Courses.all();
  const sel = document.getElementById('fee-course');
  sel.innerHTML = courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  sel.value = f.courseId;

  document.getElementById('fee-year').value       = f.year;
  document.getElementById('fee-tuition').value    = f.tuitionFee;
  document.getElementById('fee-exam').value       = f.examFee;
  document.getElementById('fee-library').value    = f.libraryFee;
  document.getElementById('fee-lab').value        = f.labFee;
  document.getElementById('fee-other').value      = f.otherFee;
  openModal('fee-modal');
  calcFeeTotal();
}

function calcFeeTotal() {
  const ids = ['fee-tuition','fee-exam','fee-library','fee-lab','fee-other'];
  const total = ids.reduce((s, id) => s + (parseFloat(document.getElementById(id)?.value) || 0), 0);
  const el = document.getElementById('fee-total-display');
  if (el) el.textContent = fmtCurrency(total);
}

function saveFeeStructure() {
  const data = {
    courseId:   parseInt(document.getElementById('fee-course').value),
    year:       parseInt(document.getElementById('fee-year').value),
    tuitionFee: parseFloat(document.getElementById('fee-tuition').value) || 0,
    examFee:    parseFloat(document.getElementById('fee-exam').value) || 0,
    libraryFee: parseFloat(document.getElementById('fee-library').value) || 0,
    labFee:     parseFloat(document.getElementById('fee-lab').value) || 0,
    otherFee:   parseFloat(document.getElementById('fee-other').value) || 0,
  };
  if (!data.courseId || !data.year) {
    toast('Please select a course and year.', 'error');
    return;
  }
  if (editFeeId) {
    DB.FeeStructures.update(editFeeId, data);
    toast('Fee structure updated!', 'success');
  } else {
    DB.FeeStructures.add(data);
    toast('Fee structure added!', 'success');
  }
  closeModal('fee-modal');
  renderFees();
}

function deleteFee(id) {
  if (!confirmAction('Delete this fee structure?')) return;
  DB.FeeStructures.delete(id);
  toast('Fee structure deleted.', 'info');
  renderFees();
}

// live total recalc
document.addEventListener('DOMContentLoaded', () => {
  ['fee-tuition','fee-exam','fee-library','fee-lab','fee-other'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calcFeeTotal);
  });
});
