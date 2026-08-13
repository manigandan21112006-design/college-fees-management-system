// ============================================================
//  College Fees Management System — localStorage Data Layer
// ============================================================

const DB = (() => {
  const KEYS = {
    students: 'cfms_students',
    feeStructures: 'cfms_fee_structures',
    payments: 'cfms_payments',
    courses: 'cfms_courses',
  };

  // ── helpers ──────────────────────────────────────────────
  const load = (key) => JSON.parse(localStorage.getItem(key) || '[]');
  const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));
  const nextId = (arr) => arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1;

  // ── seed ─────────────────────────────────────────────────
  function seed() {
    if (localStorage.getItem('cfms_seeded')) return;

    const courses = [
      { id: 1, name: 'B.Tech Computer Science', duration: 4, department: 'Engineering' },
      { id: 2, name: 'B.Tech Electronics',       duration: 4, department: 'Engineering' },
      { id: 3, name: 'BBA',                       duration: 3, department: 'Management' },
      { id: 4, name: 'B.Sc Physics',              duration: 3, department: 'Science'    },
      { id: 5, name: 'B.Com',                     duration: 3, department: 'Commerce'   },
    ];

    const feeStructures = [
      { id: 1, courseId: 1, year: 1, tuitionFee: 85000, examFee: 2500, libraryFee: 1500, labFee: 5000, otherFee: 2000, total: 96000  },
      { id: 2, courseId: 1, year: 2, tuitionFee: 85000, examFee: 2500, libraryFee: 1500, labFee: 5000, otherFee: 2000, total: 96000  },
      { id: 3, courseId: 1, year: 3, tuitionFee: 90000, examFee: 2500, libraryFee: 1500, labFee: 6000, otherFee: 2000, total: 102000 },
      { id: 4, courseId: 1, year: 4, tuitionFee: 90000, examFee: 2500, libraryFee: 1500, labFee: 6000, otherFee: 2000, total: 102000 },
      { id: 5, courseId: 2, year: 1, tuitionFee: 80000, examFee: 2500, libraryFee: 1500, labFee: 4500, otherFee: 2000, total: 90500  },
      { id: 6, courseId: 3, year: 1, tuitionFee: 55000, examFee: 2000, libraryFee: 1000, labFee: 0,    otherFee: 1500, total: 59500  },
      { id: 7, courseId: 4, year: 1, tuitionFee: 45000, examFee: 2000, libraryFee: 1000, labFee: 3000, otherFee: 1000, total: 52000  },
      { id: 8, courseId: 5, year: 1, tuitionFee: 40000, examFee: 2000, libraryFee: 1000, labFee: 0,    otherFee: 1000, total: 44000  },
    ];

    const students = [
      { id: 1,  rollNo: 'CS2301', name: 'Aarav Sharma',    email: 'aarav@college.edu',    phone: '9876543210', courseId: 1, year: 1, dob: '2005-03-12', gender: 'Male',   address: 'Mumbai', status: 'Active',   admissionDate: '2023-07-15' },
      { id: 2,  rollNo: 'CS2302', name: 'Priya Patel',     email: 'priya@college.edu',    phone: '9876543211', courseId: 1, year: 1, dob: '2005-06-22', gender: 'Female', address: 'Delhi',  status: 'Active',   admissionDate: '2023-07-15' },
      { id: 3,  rollNo: 'CS2201', name: 'Rohan Mehta',     email: 'rohan@college.edu',    phone: '9876543212', courseId: 1, year: 2, dob: '2004-01-30', gender: 'Male',   address: 'Pune',   status: 'Active',   admissionDate: '2022-07-10' },
      { id: 4,  rollNo: 'CS2202', name: 'Sneha Gupta',     email: 'sneha@college.edu',    phone: '9876543213', courseId: 1, year: 2, dob: '2004-09-14', gender: 'Female', address: 'Surat',  status: 'Active',   admissionDate: '2022-07-10' },
      { id: 5,  rollNo: 'EC2301', name: 'Karan Singh',     email: 'karan@college.edu',    phone: '9876543214', courseId: 2, year: 1, dob: '2005-11-05', gender: 'Male',   address: 'Jaipur', status: 'Active',   admissionDate: '2023-07-15' },
      { id: 6,  rollNo: 'BBA2301',name: 'Anjali Verma',    email: 'anjali@college.edu',   phone: '9876543215', courseId: 3, year: 1, dob: '2005-02-18', gender: 'Female', address: 'Indore', status: 'Active',   admissionDate: '2023-07-20' },
      { id: 7,  rollNo: 'PH2301', name: 'Vikram Nair',     email: 'vikram@college.edu',   phone: '9876543216', courseId: 4, year: 1, dob: '2005-07-25', gender: 'Male',   address: 'Kochi',  status: 'Active',   admissionDate: '2023-07-18' },
      { id: 8,  rollNo: 'COM2301',name: 'Neha Joshi',      email: 'neha@college.edu',     phone: '9876543217', courseId: 5, year: 1, dob: '2005-04-09', gender: 'Female', address: 'Nagpur', status: 'Inactive', admissionDate: '2023-07-15' },
      { id: 9,  rollNo: 'CS2101', name: 'Arjun Reddy',     email: 'arjun@college.edu',    phone: '9876543218', courseId: 1, year: 3, dob: '2003-12-01', gender: 'Male',   address: 'Hyd',    status: 'Active',   admissionDate: '2021-07-12' },
      { id: 10, rollNo: 'CS2102', name: 'Deepika Rao',     email: 'deepika@college.edu',  phone: '9876543219', courseId: 1, year: 3, dob: '2003-08-17', gender: 'Female', address: 'Chennai',status: 'Active',   admissionDate: '2021-07-12' },
    ];

    const payments = [
      { id: 1,  studentId: 1,  feeStructureId: 1,  amount: 96000, paidAmount: 96000, paymentDate: '2023-08-01', method: 'Online',  receiptNo: 'RCP001', status: 'Paid',    remark: ''           },
      { id: 2,  studentId: 2,  feeStructureId: 1,  amount: 96000, paidAmount: 50000, paymentDate: '2023-08-05', method: 'Cash',    receiptNo: 'RCP002', status: 'Partial', remark: 'Instalment 1' },
      { id: 3,  studentId: 3,  feeStructureId: 2,  amount: 96000, paidAmount: 96000, paymentDate: '2023-08-02', method: 'Cheque',  receiptNo: 'RCP003', status: 'Paid',    remark: ''           },
      { id: 4,  studentId: 4,  feeStructureId: 2,  amount: 96000, paidAmount: 0,     paymentDate: '',           method: '',        receiptNo: '',       status: 'Pending', remark: ''           },
      { id: 5,  studentId: 5,  feeStructureId: 5,  amount: 90500, paidAmount: 90500, paymentDate: '2023-08-03', method: 'Online',  receiptNo: 'RCP005', status: 'Paid',    remark: ''           },
      { id: 6,  studentId: 6,  feeStructureId: 6,  amount: 59500, paidAmount: 30000, paymentDate: '2023-08-10', method: 'Cash',    receiptNo: 'RCP006', status: 'Partial', remark: 'Instalment 1' },
      { id: 7,  studentId: 7,  feeStructureId: 7,  amount: 52000, paidAmount: 52000, paymentDate: '2023-08-07', method: 'Online',  receiptNo: 'RCP007', status: 'Paid',    remark: ''           },
      { id: 8,  studentId: 9,  feeStructureId: 3,  amount: 102000,paidAmount: 102000,paymentDate: '2023-08-01', method: 'Online',  receiptNo: 'RCP008', status: 'Paid',    remark: ''           },
      { id: 9,  studentId: 10, feeStructureId: 3,  amount: 102000,paidAmount: 75000, paymentDate: '2023-08-04', method: 'Cheque',  receiptNo: 'RCP009', status: 'Partial', remark: 'Balance due' },
    ];

    save(KEYS.courses, courses);
    save(KEYS.feeStructures, feeStructures);
    save(KEYS.students, students);
    save(KEYS.payments, payments);
    localStorage.setItem('cfms_seeded', '1');
  }

  // ── COURSES ──────────────────────────────────────────────
  const Courses = {
    all: () => load(KEYS.courses),
    get: (id) => load(KEYS.courses).find(c => c.id === id),
    add: (data) => {
      const arr = load(KEYS.courses);
      const item = { ...data, id: nextId(arr) };
      arr.push(item); save(KEYS.courses, arr); return item;
    },
    update: (id, data) => {
      const arr = load(KEYS.courses).map(c => c.id === id ? { ...c, ...data } : c);
      save(KEYS.courses, arr);
    },
    delete: (id) => {
      save(KEYS.courses, load(KEYS.courses).filter(c => c.id !== id));
    },
  };

  // ── FEE STRUCTURES ───────────────────────────────────────
  const FeeStructures = {
    all: () => load(KEYS.feeStructures),
    get: (id) => load(KEYS.feeStructures).find(f => f.id === id),
    byCourse: (courseId) => load(KEYS.feeStructures).filter(f => f.courseId === courseId),
    byCourseYear: (courseId, year) => load(KEYS.feeStructures).find(f => f.courseId === courseId && f.year === year),
    add: (data) => {
      const arr = load(KEYS.feeStructures);
      const total = (data.tuitionFee||0)+(data.examFee||0)+(data.libraryFee||0)+(data.labFee||0)+(data.otherFee||0);
      const item = { ...data, total, id: nextId(arr) };
      arr.push(item); save(KEYS.feeStructures, arr); return item;
    },
    update: (id, data) => {
      const total = (data.tuitionFee||0)+(data.examFee||0)+(data.libraryFee||0)+(data.labFee||0)+(data.otherFee||0);
      const arr = load(KEYS.feeStructures).map(f => f.id === id ? { ...f, ...data, total } : f);
      save(KEYS.feeStructures, arr);
    },
    delete: (id) => {
      save(KEYS.feeStructures, load(KEYS.feeStructures).filter(f => f.id !== id));
    },
  };

  // ── STUDENTS ─────────────────────────────────────────────
  const Students = {
    all: () => load(KEYS.students),
    get: (id) => load(KEYS.students).find(s => s.id === id),
    add: (data) => {
      const arr = load(KEYS.students);
      const item = { ...data, id: nextId(arr) };
      arr.push(item); save(KEYS.students, arr); return item;
    },
    update: (id, data) => {
      const arr = load(KEYS.students).map(s => s.id === id ? { ...s, ...data } : s);
      save(KEYS.students, arr);
    },
    delete: (id) => {
      save(KEYS.students, load(KEYS.students).filter(s => s.id !== id));
    },
    search: (query) => {
      const q = query.toLowerCase();
      return load(KEYS.students).filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    },
  };

  // ── PAYMENTS ─────────────────────────────────────────────
  const Payments = {
    all: () => load(KEYS.payments),
    get: (id) => load(KEYS.payments).find(p => p.id === id),
    byStudent: (studentId) => load(KEYS.payments).filter(p => p.studentId === studentId),
    add: (data) => {
      const arr = load(KEYS.payments);
      const item = { ...data, id: nextId(arr) };
      arr.push(item); save(KEYS.payments, arr); return item;
    },
    update: (id, data) => {
      const arr = load(KEYS.payments).map(p => p.id === id ? { ...p, ...data } : p);
      save(KEYS.payments, arr);
    },
    delete: (id) => {
      save(KEYS.payments, load(KEYS.payments).filter(p => p.id !== id));
    },
  };

  // ── STATS (for dashboard) ────────────────────────────────
  const Stats = {
    summary: () => {
      const students  = load(KEYS.students);
      const payments  = load(KEYS.payments);
      const totalFeesDue      = payments.reduce((s, p) => s + p.amount, 0);
      const totalFeesPaid     = payments.reduce((s, p) => s + p.paidAmount, 0);
      const totalFeesBalance  = totalFeesDue - totalFeesPaid;
      const paidCount         = payments.filter(p => p.status === 'Paid').length;
      const pendingCount      = payments.filter(p => p.status === 'Pending').length;
      const partialCount      = payments.filter(p => p.status === 'Partial').length;
      return {
        totalStudents:     students.length,
        activeStudents:    students.filter(s => s.status === 'Active').length,
        totalFeesDue,
        totalFeesPaid,
        totalFeesBalance,
        paidCount,
        pendingCount,
        partialCount,
      };
    },
    recentPayments: (limit = 5) => {
      return load(KEYS.payments)
        .filter(p => p.paymentDate)
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
        .slice(0, limit);
    },
    collectionByMonth: () => {
      const map = {};
      load(KEYS.payments).forEach(p => {
        if (!p.paymentDate) return;
        const month = p.paymentDate.slice(0, 7);
        map[month] = (map[month] || 0) + p.paidAmount;
      });
      return Object.entries(map).sort(([a],[b]) => a.localeCompare(b));
    },
  };

  return { seed, Courses, FeeStructures, Students, Payments, Stats };
})();
