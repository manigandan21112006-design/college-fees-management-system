// ============================================================
//  College Fees Management System — Supabase Data Layer
//  All render functions call DB.X.all() / get() / add() etc.
//  This file keeps the same interface but stores data in
//  Supabase PostgreSQL instead of localStorage.
// ============================================================

const SUPA_URL = 'https://sbbmcosqxjngmqnpgucw.supabase.co';
const SUPA_KEY = 'sb_publishable_wrlAWHOhkF793JWhZIEYSA_GYcRTR5B';

// ── Low-level fetch wrapper ───────────────────────────────────
async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey':        SUPA_KEY,
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        options.prefer || 'return=representation',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Supabase error:', res.status, err);
    throw new Error(`DB error ${res.status}: ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── In-memory cache (keeps UI synchronous after initial load) ─
const _cache = {
  courses:         [],
  feeStructures:   [],
  students:        [],
  payments:        [],
  courseSubjects:  [],
  timetable:       [],
  attendance:      [],
  examResults:     [],
};

// ── Map snake_case DB columns → camelCase JS ─────────────────
function mapCourse(r)        { return { id: r.id, name: r.name, duration: r.duration, department: r.department }; }
function mapFeeStructure(r)  { return { id: r.id, courseId: r.course_id, year: r.year, tuitionFee: r.tuition_fee, examFee: r.exam_fee, libraryFee: r.library_fee, labFee: r.lab_fee, otherFee: r.other_fee, total: r.total }; }
function mapStudent(r)       { return { id: r.id, rollNo: r.roll_no, name: r.name, email: r.email||'', phone: r.phone||'', dob: r.dob||'', gender: r.gender||'', address: r.address||'', courseId: r.course_id, year: r.year, status: r.status, admissionDate: r.admission_date||'' }; }
function mapPayment(r)       { return { id: r.id, studentId: r.student_id, feeStructureId: r.fee_structure_id, amount: r.amount, paidAmount: r.paid_amount, paymentDate: r.payment_date||'', method: r.method||'', receiptNo: r.receipt_no||'', status: r.status, remark: r.remark||'' }; }
function mapSubject(r)       { return { id: r.id, courseId: r.course_id, year: r.year, code: r.code, name: r.name, credits: r.credits }; }
function mapTimetable(r)     { return { id: r.id, courseId: r.course_id, year: r.year, day: r.day, period: r.period, subjectCode: r.subject_code, subjectName: r.subject_name, room: r.room||'', faculty: r.faculty||'' }; }
function mapAttendance(r)    { return { id: r.id, studentId: r.student_id, subjectCode: r.subject_code, subjectName: r.subject_name, date: r.date, status: r.status }; }
function mapExamResult(r)    { return { id: r.id, studentId: r.student_id, semester: r.semester, subjectCode: r.subject_code, subjectName: r.subject_name, maxMarks: r.max_marks, cieMarks: r.cie_marks, seeMarks: r.see_marks, totalMarks: r.total_marks, grade: r.grade||'', result: r.result||'' }; }

// ── Map camelCase JS → snake_case DB ─────────────────────────
function toDbCourse(d)       { return { name: d.name, duration: d.duration, department: d.department }; }
function toDbFeeStructure(d) { return { course_id: d.courseId, year: d.year, tuition_fee: d.tuitionFee||0, exam_fee: d.examFee||0, library_fee: d.libraryFee||0, lab_fee: d.labFee||0, other_fee: d.otherFee||0, total: d.total||0 }; }
function toDbStudent(d)      { return { roll_no: d.rollNo, name: d.name, email: d.email||null, phone: d.phone||null, dob: d.dob||null, gender: d.gender||null, address: d.address||null, course_id: d.courseId, year: d.year, status: d.status, admission_date: d.admissionDate||null }; }
function toDbPayment(d)      { return { student_id: d.studentId, fee_structure_id: d.feeStructureId||null, amount: d.amount, paid_amount: d.paidAmount, payment_date: d.paymentDate||null, method: d.method||null, receipt_no: d.receiptNo||null, status: d.status, remark: d.remark||null }; }
function toDbSubject(d)      { return { course_id: d.courseId, year: d.year, code: d.code, name: d.name, credits: d.credits||3 }; }
function toDbTimetable(d)    { return { course_id: d.courseId, year: d.year, day: d.day, period: d.period, subject_code: d.subjectCode, subject_name: d.subjectName, room: d.room||null, faculty: d.faculty||null }; }
function toDbAttendance(d)   { return { student_id: d.studentId, subject_code: d.subjectCode, subject_name: d.subjectName, date: d.date, status: d.status }; }
function toDbExamResult(d)   { return { student_id: d.studentId, semester: d.semester, subject_code: d.subjectCode, subject_name: d.subjectName, max_marks: d.maxMarks||100, cie_marks: d.cieMarks||0, see_marks: d.seeMarks||0, total_marks: d.totalMarks||0, grade: d.grade||null, result: d.result||null }; }

// ── Generic collection factory ────────────────────────────────
function makeCollection(table, cacheKey, mapFn, toDbFn, extraMethods = {}) {
  return {
    // Synchronous reads from cache (use after DB.load())
    all:    ()     => _cache[cacheKey],
    get:    (id)   => _cache[cacheKey].find(r => r.id === id),

    // Async writes — update DB then refresh cache
    add: async (data) => {
      const rows = await sbFetch(table, { method: 'POST', body: JSON.stringify(toDbFn(data)) });
      const item = mapFn(rows[0]);
      _cache[cacheKey].push(item);
      return item;
    },
    update: async (id, data) => {
      await sbFetch(`${table}?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(toDbFn(data)) });
      const idx = _cache[cacheKey].findIndex(r => r.id === id);
      if (idx >= 0) _cache[cacheKey][idx] = { ..._cache[cacheKey][idx], ...data, id };
    },
    delete: async (id) => {
      await sbFetch(`${table}?id=eq.${id}`, { method: 'DELETE', prefer: 'return=minimal', headers: { 'Prefer': 'return=minimal' } });
      _cache[cacheKey] = _cache[cacheKey].filter(r => r.id !== id);
    },

    // Async reload from DB into cache
    reload: async () => {
      const rows = await sbFetch(`${table}?order=id`);
      _cache[cacheKey] = (rows || []).map(mapFn);
    },

    ...extraMethods,
  };
}

// ── DB object (same interface as before) ──────────────────────
const DB = {

  // ── Load all data into cache ── call once on app start ──────
  load: async () => {
    try {
      const [courses, fees, students, payments, subjects, timetable, attendance, results] = await Promise.all([
        sbFetch('courses?order=id'),
        sbFetch('fee_structures?order=id'),
        sbFetch('students?order=id'),
        sbFetch('payments?order=id'),
        sbFetch('course_subjects?order=id'),
        sbFetch('timetable?order=id'),
        sbFetch('attendance?order=id'),
        sbFetch('exam_results?order=id'),
      ]);
      _cache.courses        = (courses     || []).map(mapCourse);
      _cache.feeStructures  = (fees        || []).map(mapFeeStructure);
      _cache.students       = (students    || []).map(mapStudent);
      _cache.payments       = (payments    || []).map(mapPayment);
      _cache.courseSubjects = (subjects    || []).map(mapSubject);
      _cache.timetable      = (timetable   || []).map(mapTimetable);
      _cache.attendance     = (attendance  || []).map(mapAttendance);
      _cache.examResults    = (results     || []).map(mapExamResult);
      return true;
    } catch(e) {
      console.error('DB.load failed:', e);
      return false;
    }
  },

  // Keep seed as a no-op — data lives in Supabase now
  seed: () => {},

  // ── Collections ──────────────────────────────────────────────
  Courses: makeCollection('courses', 'courses', mapCourse, toDbCourse),

  FeeStructures: makeCollection('fee_structures', 'feeStructures', mapFeeStructure, toDbFeeStructure, {
    byCourse:    (courseId)       => _cache.feeStructures.filter(f => f.courseId === courseId),
    byCourseYear:(courseId, year) => _cache.feeStructures.find(f => f.courseId === courseId && f.year === parseInt(year)),
  }),

  Students: makeCollection('students', 'students', mapStudent, toDbStudent, {
    search: (q) => {
      const lq = q.toLowerCase();
      return _cache.students.filter(s =>
        s.name.toLowerCase().includes(lq) ||
        s.rollNo.toLowerCase().includes(lq) ||
        (s.email||'').toLowerCase().includes(lq)
      );
    },
  }),

  Payments: makeCollection('payments', 'payments', mapPayment, toDbPayment, {
    byStudent: (studentId) => _cache.payments.filter(p => p.studentId === studentId),
  }),

  CourseSubjects: makeCollection('course_subjects', 'courseSubjects', mapSubject, toDbSubject, {
    byCourseYear: (courseId, year) => _cache.courseSubjects.filter(s => s.courseId === courseId && s.year === parseInt(year)),
  }),

  Timetable: makeCollection('timetable', 'timetable', mapTimetable, toDbTimetable, {
    byCourseYear: (courseId, year) => _cache.timetable.filter(t => t.courseId === courseId && t.year === parseInt(year)),
  }),

  Attendance: {
    all:       ()          => _cache.attendance,
    get:       (id)        => _cache.attendance.find(a => a.id === id),
    byStudent: (studentId) => _cache.attendance.filter(a => a.studentId === studentId),

    summaryByStudent: (studentId) => {
      const recs = _cache.attendance.filter(a => a.studentId === studentId);
      const map  = {};
      recs.forEach(a => {
        if (!map[a.subjectCode]) map[a.subjectCode] = { subjectCode: a.subjectCode, subjectName: a.subjectName, present: 0, absent: 0 };
        if (a.status === 'Present') map[a.subjectCode].present++;
        else map[a.subjectCode].absent++;
      });
      return Object.values(map).map(s => ({
        ...s, total: s.present + s.absent,
        pct: s.present + s.absent > 0 ? Math.round((s.present / (s.present + s.absent)) * 100) : 0,
      }));
    },

    add: async (data) => {
      const rows = await sbFetch('attendance', { method: 'POST', body: JSON.stringify(toDbAttendance(data)) });
      const item = mapAttendance(rows[0]);
      _cache.attendance.push(item);
      return item;
    },
    update: async (id, data) => {
      await sbFetch(`attendance?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: data.status }) });
      const idx = _cache.attendance.findIndex(a => a.id === id);
      if (idx >= 0) _cache.attendance[idx] = { ..._cache.attendance[idx], ...data };
    },
    delete: async (id) => {
      await sbFetch(`attendance?id=eq.${id}`, { method: 'DELETE', headers: { 'Prefer': 'return=minimal' } });
      _cache.attendance = _cache.attendance.filter(a => a.id !== id);
    },
    bulkMark: async (records) => {
      // upsert all records at once using Supabase upsert (on conflict update)
      const rows = records.map(toDbAttendance);
      await sbFetch('attendance', {
        method:  'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body:    JSON.stringify(rows),
      });
      // Reload attendance cache
      const fresh = await sbFetch('attendance?order=id');
      _cache.attendance = (fresh || []).map(mapAttendance);
    },
    reload: async () => {
      const rows = await sbFetch('attendance?order=id');
      _cache.attendance = (rows || []).map(mapAttendance);
    },
  },

  ExamResults: makeCollection('exam_results', 'examResults', mapExamResult, toDbExamResult, {
    byStudent: (studentId) => _cache.examResults.filter(r => r.studentId === studentId),
  }),

  // ── Stats (computed from cache) ───────────────────────────
  Stats: {
    summary: () => {
      const students = _cache.students;
      const payments = _cache.payments;
      return {
        totalStudents:    students.length,
        activeStudents:   students.filter(s => s.status === 'Active').length,
        totalFeesDue:     payments.reduce((s, p) => s + p.amount, 0),
        totalFeesPaid:    payments.reduce((s, p) => s + p.paidAmount, 0),
        totalFeesBalance: payments.reduce((s, p) => s + (p.amount - p.paidAmount), 0),
        paidCount:        payments.filter(p => p.status === 'Paid').length,
        pendingCount:     payments.filter(p => p.status === 'Pending').length,
        partialCount:     payments.filter(p => p.status === 'Partial').length,
      };
    },
    recentPayments: (limit = 5) =>
      [..._cache.payments]
        .filter(p => p.paymentDate)
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
        .slice(0, limit),
    collectionByMonth: () => {
      const map = {};
      _cache.payments.forEach(p => {
        if (!p.paymentDate) return;
        const month = p.paymentDate.slice(0, 7);
        map[month] = (map[month] || 0) + p.paidAmount;
      });
      return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
    },
  },
};
