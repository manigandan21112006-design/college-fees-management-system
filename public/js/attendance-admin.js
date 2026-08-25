// ============================================================
//  Attendance Admin Page
// ============================================================

function renderAttendanceAdmin() {
  const courses  = DB.Courses.all();
  const students = DB.Students.all();

  // Course filter
  const courseSel = document.getElementById('att-filter-course');
  courseSel.innerHTML = '<option value="">All Courses</option>' +
    courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  // Student filter
  const studentSel = document.getElementById('att-filter-student');
  studentSel.innerHTML = '<option value="">All Students</option>' +
    students.map(s => `<option value="${s.id}">${s.name} (${s.rollNo})</option>`).join('');

  courseSel.onchange  = renderAttendanceRows;
  studentSel.onchange = renderAttendanceRows;

  renderAttendanceRows();
}

function renderAttendanceRows() {
  const courseId  = parseInt(document.getElementById('att-filter-course').value)  || null;
  const studentId = parseInt(document.getElementById('att-filter-student').value) || null;

  let records  = DB.Attendance.all();
  const students = DB.Students.all();

  if (courseId) {
    const courseStudentIds = students.filter(s => s.courseId === courseId).map(s => s.id);
    records = records.filter(r => courseStudentIds.includes(r.studentId));
  }
  if (studentId) records = records.filter(r => r.studentId === studentId);

  // Sort newest first
  records = [...records].sort((a,b) => new Date(b.date) - new Date(a.date));

  const tbody = document.getElementById('attendance-tbody');
  if (!records.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📋</div><h3>No records found</h3></div></td></tr>`;
    return;
  }

  tbody.innerHTML = records.map(r => {
    const s = students.find(st => st.id === r.studentId);
    const statusColor = r.status === 'Present' ? 'badge-success' : 'badge-danger';
    return `<tr>
      <td><div class="fw-bold">${s ? s.name : '—'}</div><div class="text-muted" style="font-size:.75rem">${s ? s.rollNo : ''}</div></td>
      <td><span class="badge badge-info" style="font-size:.75rem">${r.subjectCode}</span> ${r.subjectName}</td>
      <td>${fmtDate(r.date)}</td>
      <td><span class="badge ${statusColor}">${r.status}</span></td>
      <td>
        <div class="flex gap-2">
          <button class="btn btn-outline btn-sm" onclick="toggleAttendance(${r.id})">${r.status === 'Present' ? 'Mark Absent' : 'Mark Present'}</button>
          <button class="btn btn-danger btn-sm"  onclick="deleteAttendanceRecord(${r.id})">Del</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function toggleAttendance(id) {
  const rec = DB.Attendance.get(id);
  if (!rec) return;
  DB.Attendance.update(id, { status: rec.status === 'Present' ? 'Absent' : 'Present' });
  toast('Attendance updated.', 'success');
  renderAttendanceRows();
}

function deleteAttendanceRecord(id) {
  if (!confirmAction('Delete this attendance record?')) return;
  DB.Attendance.delete(id);
  toast('Record deleted.', 'info');
  renderAttendanceRows();
}

// ── Mark Attendance Modal ─────────────────────────────────
function openMarkAttendance() {
  const courses = DB.Courses.all();
  const courseSel = document.getElementById('mark-att-course');
  courseSel.innerHTML = courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  document.getElementById('mark-att-date').value = new Date().toISOString().slice(0,10);
  onMarkAttCourseChange();
  openModal('attendance-modal');
}

function onMarkAttCourseChange() {
  const courseId = parseInt(document.getElementById('mark-att-course').value);
  const year     = parseInt(document.getElementById('mark-att-year').value);

  // Populate subject dropdown
  const subjects = DB.CourseSubjects.byCourseYear(courseId, year);
  const subSel   = document.getElementById('mark-att-subject');
  subSel.innerHTML = subjects.length
    ? subjects.map(s => `<option value="${s.code}|${s.name}">${s.code} — ${s.name}</option>`).join('')
    : '<option value="">No subjects</option>';

  // Populate student list
  const students = DB.Students.all().filter(s => s.courseId === courseId && s.year === year && s.status === 'Active');
  const container = document.getElementById('mark-att-students');

  if (!students.length) {
    container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:20px">No active students for this course/year.</p>';
    return;
  }

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:10px;padding:0 4px">
      <span style="font-size:.8rem;font-weight:700;color:#475569">${students.length} Students</span>
      <div style="display:flex;gap:8px">
        <button type="button" class="btn btn-outline btn-sm" onclick="markAllPresent()">All Present</button>
        <button type="button" class="btn btn-outline btn-sm" onclick="markAllAbsent()">All Absent</button>
      </div>
    </div>` +
    students.map(s => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-radius:8px;margin-bottom:4px;background:#f8fafc">
        <div>
          <span style="font-weight:600;font-size:.88rem">${s.name}</span>
          <span style="color:#94a3b8;font-size:.75rem;margin-left:8px">${s.rollNo}</span>
        </div>
        <div style="display:flex;gap:6px">
          <label style="display:flex;align-items:center;gap:4px;font-size:.82rem;cursor:pointer;color:#16a34a;font-weight:600">
            <input type="radio" name="att_${s.id}" value="Present" checked style="accent-color:#16a34a"> Present
          </label>
          <label style="display:flex;align-items:center;gap:4px;font-size:.82rem;cursor:pointer;color:#dc2626;font-weight:600">
            <input type="radio" name="att_${s.id}" value="Absent" style="accent-color:#dc2626"> Absent
          </label>
        </div>
      </div>`).join('');
}

function markAllPresent() {
  document.querySelectorAll('#mark-att-students input[value="Present"]').forEach(r => r.checked = true);
}
function markAllAbsent() {
  document.querySelectorAll('#mark-att-students input[value="Absent"]').forEach(r => r.checked = true);
}

function saveAttendance() {
  const courseId = parseInt(document.getElementById('mark-att-course').value);
  const year     = parseInt(document.getElementById('mark-att-year').value);
  const date     = document.getElementById('mark-att-date').value;
  const subVal   = document.getElementById('mark-att-subject').value;

  if (!date || !subVal) { toast('Please select a date and subject.', 'error'); return; }

  const [subjectCode, subjectName] = subVal.split('|');
  const students = DB.Students.all().filter(s => s.courseId === courseId && s.year === year && s.status === 'Active');

  const records = students.map(s => {
    const radio = document.querySelector(`input[name="att_${s.id}"]:checked`);
    return { studentId: s.id, subjectCode, subjectName, date, status: radio ? radio.value : 'Present' };
  });

  DB.Attendance.bulkMark(records);
  toast(`Attendance saved for ${records.length} students.`, 'success');
  closeModal('attendance-modal');
  renderAttendanceRows();
}
