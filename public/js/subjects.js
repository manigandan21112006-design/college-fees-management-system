// ============================================================
//  Subjects Admin Page
// ============================================================

let editSubjectId = null;

function renderSubjects() {
  const subjects = DB.CourseSubjects.all();
  const courses  = DB.Courses.all();

  // Build course filter buttons
  const filterWrap = document.getElementById('subject-filter-wrap');
  filterWrap.innerHTML =
    `<button class="btn btn-primary btn-sm subj-filter" data-cid="all">All</button>` +
    courses.map(c => `<button class="btn btn-outline btn-sm subj-filter" data-cid="${c.id}">${c.name}</button>`).join('');

  filterWrap.querySelectorAll('.subj-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      filterWrap.querySelectorAll('.subj-filter').forEach(b => b.classList.replace('btn-primary','btn-outline'));
      btn.classList.replace('btn-outline','btn-primary');
      renderSubjectRows(btn.dataset.cid === 'all' ? null : parseInt(btn.dataset.cid));
    });
  });

  renderSubjectRows(null);
}

function renderSubjectRows(filterCourseId) {
  const subjects = DB.CourseSubjects.all();
  const courses  = DB.Courses.all();
  const filtered = filterCourseId ? subjects.filter(s => s.courseId === filterCourseId) : subjects;
  const tbody    = document.getElementById('subjects-tbody');

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📚</div><h3>No subjects found</h3></div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const c = courses.find(c => c.id === s.courseId);
    return `<tr>
      <td><span class="badge badge-info" style="font-size:.8rem">${s.code}</span></td>
      <td class="fw-bold">${s.name}</td>
      <td>${c ? c.name : '—'}</td>
      <td>Year ${s.year}</td>
      <td>${s.credits || '—'}</td>
      <td>
        <div class="flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="openEditSubject(${s.id})">Edit</button>
          <button class="btn btn-danger btn-sm"  onclick="deleteSubject(${s.id})">Del</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function openAddSubject() {
  editSubjectId = null;
  document.getElementById('subject-modal-title').textContent = 'Add Subject';
  document.getElementById('subject-form').reset();
  populateSubjectCourseDropdown();
  openModal('subject-modal');
}

function openEditSubject(id) {
  const s = DB.CourseSubjects.get(id);
  if (!s) return;
  editSubjectId = id;
  document.getElementById('subject-modal-title').textContent = 'Edit Subject';
  populateSubjectCourseDropdown();
  document.getElementById('subject-code').value    = s.code;
  document.getElementById('subject-name').value    = s.name;
  document.getElementById('subject-course').value  = s.courseId;
  document.getElementById('subject-year').value    = s.year;
  document.getElementById('subject-credits').value = s.credits;
  openModal('subject-modal');
}

function populateSubjectCourseDropdown() {
  const sel = document.getElementById('subject-course');
  sel.innerHTML = DB.Courses.all().map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function saveSubject() {
  const data = {
    code:     document.getElementById('subject-code').value.trim().toUpperCase(),
    name:     document.getElementById('subject-name').value.trim(),
    courseId: parseInt(document.getElementById('subject-course').value),
    year:     parseInt(document.getElementById('subject-year').value),
    credits:  parseInt(document.getElementById('subject-credits').value) || 3,
  };
  if (!data.code || !data.name || !data.courseId) { toast('Please fill all required fields.', 'error'); return; }

  if (editSubjectId) {
    DB.CourseSubjects.update(editSubjectId, data);
    toast('Subject updated!', 'success');
  } else {
    DB.CourseSubjects.add(data);
    toast('Subject added!', 'success');
  }
  closeModal('subject-modal');
  renderSubjects();
}

function deleteSubject(id) {
  if (!confirmAction('Delete this subject?')) return;
  DB.CourseSubjects.delete(id);
  toast('Subject deleted.', 'info');
  renderSubjects();
}
