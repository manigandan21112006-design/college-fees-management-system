// ============================================================
//  Exam Results Admin Page
// ============================================================

let editResultId = null;

function renderExamsAdmin() {
  const students = DB.Students.all();
  const results  = DB.ExamResults.all();

  // Student filter dropdown
  const studentSel = document.getElementById('exam-filter-student');
  studentSel.innerHTML = '<option value="">All Students</option>' +
    students.map(s => `<option value="${s.id}">${s.name} (${s.rollNo})</option>`).join('');

  // Semester filter
  const sems = [...new Set(results.map(r => r.semester))].sort();
  const semSel = document.getElementById('exam-filter-sem');
  semSel.innerHTML = '<option value="">All Semesters</option>' +
    sems.map(s => `<option value="${s}">${s}</option>`).join('');

  studentSel.onchange = renderExamRows;
  semSel.onchange     = renderExamRows;

  renderExamRows();
}

function renderExamRows() {
  const studentId = parseInt(document.getElementById('exam-filter-student').value) || null;
  const sem       = document.getElementById('exam-filter-sem').value;

  let results  = DB.ExamResults.all();
  const students = DB.Students.all();

  if (studentId) results = results.filter(r => r.studentId === studentId);
  if (sem)       results = results.filter(r => r.semester === sem);

  const tbody = document.getElementById('exams-tbody');
  if (!results.length) {
    tbody.innerHTML = `<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">📝</div><h3>No results found</h3></div></td></tr>`;
    return;
  }

  tbody.innerHTML = results.map(r => {
    const s = students.find(st => st.id === r.studentId);
    const gradeCls = r.grade === 'F' ? 'badge-danger' : r.grade === 'O' ? 'badge-success' : r.grade === 'A' || r.grade === 'A+' ? 'badge-success' : 'badge-warning';
    const resultCls = r.result === 'Pass' ? 'badge-success' : 'badge-danger';
    return `<tr>
      <td><div class="fw-bold">${s ? s.name : '—'}</div><div class="text-muted" style="font-size:.75rem">${s ? s.rollNo : ''}</div></td>
      <td>${r.semester}</td>
      <td><span class="badge badge-info" style="font-size:.75rem">${r.subjectCode}</span></td>
      <td>${r.subjectName}</td>
      <td>${r.cieMarks ?? '—'}</td>
      <td>${r.seeMarks ?? '—'}</td>
      <td class="fw-bold">${r.totalMarks ?? '—'} / ${r.maxMarks ?? 100}</td>
      <td><span class="badge ${gradeCls}">${r.grade || '—'}</span></td>
      <td><span class="badge ${resultCls}">${r.result || '—'}</span></td>
      <td>
        <div class="flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="openEditResult(${r.id})">Edit</button>
          <button class="btn btn-danger btn-sm"  onclick="deleteResult(${r.id})">Del</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function openAddResult() {
  editResultId = null;
  document.getElementById('result-modal-title').textContent = 'Add Exam Result';
  document.getElementById('result-form').reset();
  document.getElementById('result-max').value = 100;
  populateResultStudentDropdown();
  openModal('result-modal');
}

function openEditResult(id) {
  const r = DB.ExamResults.get(id);
  if (!r) return;
  editResultId = id;
  document.getElementById('result-modal-title').textContent = 'Edit Exam Result';
  populateResultStudentDropdown();
  document.getElementById('result-student').value = r.studentId;
  document.getElementById('result-sem').value     = r.semester;
  document.getElementById('result-code').value    = r.subjectCode;
  document.getElementById('result-subject').value = r.subjectName;
  document.getElementById('result-max').value     = r.maxMarks;
  document.getElementById('result-cie').value     = r.cieMarks;
  document.getElementById('result-see').value     = r.seeMarks;
  document.getElementById('result-grade').value   = r.grade;
  openModal('result-modal');
}

function populateResultStudentDropdown() {
  const sel = document.getElementById('result-student');
  sel.innerHTML = '<option value="">Select Student</option>' +
    DB.Students.all().filter(s => s.status === 'Active').map(s =>
      `<option value="${s.id}">${s.name} (${s.rollNo})</option>`
    ).join('');
}

function autoGrade(cie, see, max) {
  const total = cie + see;
  const pct   = (total / max) * 100;
  if (pct >= 90) return { grade: 'O',  result: 'Pass' };
  if (pct >= 80) return { grade: 'A+', result: 'Pass' };
  if (pct >= 70) return { grade: 'A',  result: 'Pass' };
  if (pct >= 60) return { grade: 'B+', result: 'Pass' };
  if (pct >= 55) return { grade: 'B',  result: 'Pass' };
  if (pct >= 50) return { grade: 'C',  result: 'Pass' };
  if (pct >= 40) return { grade: 'D',  result: 'Pass' };
  return { grade: 'F', result: 'Fail' };
}

function saveResult() {
  const cieMarks = parseFloat(document.getElementById('result-cie').value) || 0;
  const seeMarks = parseFloat(document.getElementById('result-see').value) || 0;
  const maxMarks = parseFloat(document.getElementById('result-max').value) || 100;
  const gradeOverride = document.getElementById('result-grade').value;
  const auto = autoGrade(cieMarks, seeMarks, maxMarks);

  const data = {
    studentId:   parseInt(document.getElementById('result-student').value),
    semester:    document.getElementById('result-sem').value.trim(),
    subjectCode: document.getElementById('result-code').value.trim().toUpperCase(),
    subjectName: document.getElementById('result-subject').value.trim(),
    maxMarks,
    cieMarks,
    seeMarks,
    totalMarks: cieMarks + seeMarks,
    grade:  gradeOverride || auto.grade,
    result: auto.result,
  };

  if (!data.studentId || !data.semester || !data.subjectCode) {
    toast('Please fill all required fields.', 'error'); return;
  }

  if (editResultId) {
    DB.ExamResults.update(editResultId, data);
    toast('Result updated!', 'success');
  } else {
    DB.ExamResults.add(data);
    toast('Result added!', 'success');
  }
  closeModal('result-modal');
  renderExamsAdmin();
}

function deleteResult(id) {
  if (!confirmAction('Delete this result?')) return;
  DB.ExamResults.delete(id);
  toast('Result deleted.', 'info');
  renderExamsAdmin();
}
