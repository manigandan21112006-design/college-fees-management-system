// ============================================================
//  Timetable Admin Page
// ============================================================

let editTimetableId = null;
const DAYS_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function renderTimetableAdmin() {
  const courses = DB.Courses.all();
  const sel = document.getElementById('tt-filter-course');
  sel.innerHTML = '<option value="">All Courses</option>' +
    courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  sel.onchange = renderTimetableGrid;
  document.getElementById('tt-filter-year').onchange = renderTimetableGrid;

  renderTimetableGrid();
}

function renderTimetableGrid() {
  const courseId = parseInt(document.getElementById('tt-filter-course').value) || null;
  const year     = parseInt(document.getElementById('tt-filter-year').value)   || null;

  let slots = DB.Timetable.all();
  if (courseId) slots = slots.filter(s => s.courseId === courseId);
  if (year)     slots = slots.filter(s => s.year === year);

  const container = document.getElementById('timetable-grid');

  if (!slots.length) {
    container.innerHTML = `<div class="empty-state" style="padding:40px"><div class="empty-icon">📅</div><h3>No timetable slots found</h3><p>Add slots using the "+ Add Slot" button.</p></div>`;
    return;
  }

  // Group by day
  const byDay = {};
  DAYS_ORDER.forEach(d => { byDay[d] = []; });
  slots.forEach(s => { if (byDay[s.day]) byDay[s.day].push(s); else byDay[s.day] = [s]; });

  const courses = DB.Courses.all();
  container.innerHTML = DAYS_ORDER.filter(d => byDay[d].length).map(day => {
    const daySlots = byDay[day].sort((a,b) => a.period.localeCompare(b.period));
    return `
      <div style="padding:16px 20px;border-bottom:1px solid var(--border)">
        <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#2563eb;margin-bottom:12px">${day}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">
          ${daySlots.map(s => {
            const c = courses.find(c => c.id === s.courseId);
            return `
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;position:relative">
              <div style="font-size:.75rem;color:#94a3b8;margin-bottom:4px">${s.period}</div>
              <div style="font-weight:700;color:#1e293b;font-size:.9rem;margin-bottom:2px">${s.subjectName}</div>
              <div style="font-size:.75rem;color:#2563eb;font-weight:600">${s.subjectCode}</div>
              <div style="font-size:.75rem;color:#64748b;margin-top:4px">${s.faculty || ''} ${s.room ? '· '+s.room : ''}</div>
              ${c ? `<div style="font-size:.7rem;color:#94a3b8;margin-top:2px">${c.name} · Year ${s.year}</div>` : ''}
              <div style="position:absolute;top:8px;right:8px;display:flex;gap:4px">
                <button class="btn btn-outline btn-sm" style="padding:2px 7px;font-size:.7rem" onclick="openEditTimetable(${s.id})">✏️</button>
                <button class="btn btn-danger btn-sm"  style="padding:2px 7px;font-size:.7rem" onclick="deleteTimetable(${s.id})">✕</button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }).join('');
}

function openAddTimetable() {
  editTimetableId = null;
  document.getElementById('timetable-modal-title').textContent = 'Add Timetable Slot';
  document.getElementById('timetable-form').reset();
  populateTtCourseDropdown();
  openModal('timetable-modal');
}

function openEditTimetable(id) {
  const t = DB.Timetable.get(id);
  if (!t) return;
  editTimetableId = id;
  document.getElementById('timetable-modal-title').textContent = 'Edit Timetable Slot';
  populateTtCourseDropdown();
  document.getElementById('tt-course').value  = t.courseId;
  document.getElementById('tt-year').value    = t.year;
  onTtCourseChange();
  setTimeout(() => {
    document.getElementById('tt-day').value     = t.day;
    document.getElementById('tt-period').value  = t.period;
    document.getElementById('tt-subject').value = t.subjectCode;
    document.getElementById('tt-room').value    = t.room || '';
    document.getElementById('tt-faculty').value = t.faculty || '';
  }, 50);
  openModal('timetable-modal');
}

function populateTtCourseDropdown() {
  const sel = document.getElementById('tt-course');
  sel.innerHTML = DB.Courses.all().map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  onTtCourseChange();
}

function onTtCourseChange() {
  const courseId = parseInt(document.getElementById('tt-course').value);
  const year     = parseInt(document.getElementById('tt-year').value);
  const subjects = DB.CourseSubjects.byCourseYear(courseId, year);
  const sel = document.getElementById('tt-subject');
  sel.innerHTML = subjects.length
    ? subjects.map(s => `<option value="${s.code}">${s.code} — ${s.name}</option>`).join('')
    : '<option value="">No subjects for this course/year</option>';
}

function saveTimetable() {
  const courseId = parseInt(document.getElementById('tt-course').value);
  const year     = parseInt(document.getElementById('tt-year').value);
  const subCode  = document.getElementById('tt-subject').value;
  const subjects = DB.CourseSubjects.byCourseYear(courseId, year);
  const subj     = subjects.find(s => s.code === subCode);

  const data = {
    courseId,
    year,
    day:         document.getElementById('tt-day').value,
    period:      document.getElementById('tt-period').value.trim(),
    subjectCode: subCode,
    subjectName: subj ? subj.name : subCode,
    room:        document.getElementById('tt-room').value.trim(),
    faculty:     document.getElementById('tt-faculty').value.trim(),
  };
  if (!data.period || !data.subjectCode) { toast('Please fill required fields.', 'error'); return; }

  if (editTimetableId) {
    DB.Timetable.update(editTimetableId, data);
    toast('Slot updated!', 'success');
  } else {
    DB.Timetable.add(data);
    toast('Slot added!', 'success');
  }
  closeModal('timetable-modal');
  renderTimetableGrid();
}

function deleteTimetable(id) {
  if (!confirmAction('Delete this timetable slot?')) return;
  DB.Timetable.delete(id);
  toast('Slot deleted.', 'info');
  renderTimetableGrid();
}
