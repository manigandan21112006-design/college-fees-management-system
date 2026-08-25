// ============================================================
//  College Fees Management System — localStorage Data Layer
// ============================================================

const DB = (() => {
  const KEYS = {
    students: 'cfms_students',
    feeStructures: 'cfms_fee_structures',
    payments: 'cfms_payments',
    courses: 'cfms_courses',
    courseSubjects: 'cfms_course_subjects',
    attendance: 'cfms_attendance',
    timetable: 'cfms_timetable',
    examResults: 'cfms_exam_results',
  };

  // ── helpers ──────────────────────────────────────────────
  const load = (key) => JSON.parse(localStorage.getItem(key) || '[]');
  const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));
  const nextId = (arr) => arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1;

  // ── seed ─────────────────────────────────────────────────
  function seed() {
    // v2 forces re-seed to add new collections (attendance, timetable, exam results, subjects)
    if (localStorage.getItem('cfms_seeded') === 'v2') return;
    // Clear old seed flag and all data so new seed runs fresh
    localStorage.removeItem('cfms_seeded');
    localStorage.removeItem('cfms_course_subjects');
    localStorage.removeItem('cfms_timetable');
    localStorage.removeItem('cfms_attendance');
    localStorage.removeItem('cfms_exam_results');

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

    // ── Course Subjects ──────────────────────────────────────
    // Each subject belongs to a course + year, has a code and name
    const courseSubjects = [
      // B.Tech CS Year 1 (courseId:1)
      { id:1,  courseId:1, year:1, code:'CS101', name:'Engineering Mathematics I',   credits:4 },
      { id:2,  courseId:1, year:1, code:'CS102', name:'Programming in C',            credits:4 },
      { id:3,  courseId:1, year:1, code:'CS103', name:'Digital Logic Design',        credits:3 },
      { id:4,  courseId:1, year:1, code:'CS104', name:'Engineering Physics',         credits:3 },
      { id:5,  courseId:1, year:1, code:'CS105', name:'Communication Skills',        credits:2 },
      // B.Tech CS Year 2 (courseId:1)
      { id:6,  courseId:1, year:2, code:'CS201', name:'Data Structures',             credits:4 },
      { id:7,  courseId:1, year:2, code:'CS202', name:'Computer Organisation',       credits:3 },
      { id:8,  courseId:1, year:2, code:'CS203', name:'Discrete Mathematics',        credits:3 },
      { id:9,  courseId:1, year:2, code:'CS204', name:'Object Oriented Programming', credits:4 },
      { id:10, courseId:1, year:2, code:'CS205', name:'Database Management Systems', credits:4 },
      // B.Tech CS Year 3 (courseId:1)
      { id:11, courseId:1, year:3, code:'CS301', name:'Operating Systems',           credits:4 },
      { id:12, courseId:1, year:3, code:'CS302', name:'Computer Networks',           credits:4 },
      { id:13, courseId:1, year:3, code:'CS303', name:'Algorithm Design',            credits:3 },
      // B.Tech Electronics Year 1 (courseId:2)
      { id:14, courseId:2, year:1, code:'EC101', name:'Basic Electronics',           credits:4 },
      { id:15, courseId:2, year:1, code:'EC102', name:'Circuit Theory',              credits:4 },
      { id:16, courseId:2, year:1, code:'EC103', name:'Engineering Mathematics',     credits:3 },
      { id:17, courseId:2, year:1, code:'EC104', name:'Electronic Devices',          credits:3 },
      // BBA Year 1 (courseId:3)
      { id:18, courseId:3, year:1, code:'BBA101', name:'Principles of Management',  credits:4 },
      { id:19, courseId:3, year:1, code:'BBA102', name:'Business Communication',    credits:3 },
      { id:20, courseId:3, year:1, code:'BBA103', name:'Financial Accounting',      credits:4 },
      // B.Sc Physics Year 1 (courseId:4)
      { id:21, courseId:4, year:1, code:'PH101',  name:'Mechanics',                 credits:4 },
      { id:22, courseId:4, year:1, code:'PH102',  name:'Thermodynamics',            credits:3 },
      { id:23, courseId:4, year:1, code:'PH103',  name:'Optics',                    credits:3 },
      // B.Com Year 1 (courseId:5)
      { id:24, courseId:5, year:1, code:'COM101', name:'Business Economics',        credits:3 },
      { id:25, courseId:5, year:1, code:'COM102', name:'Accountancy',               credits:4 },
    ];

    // ── Timetable ────────────────────────────────────────────
    // One timetable slot = courseId + year + day + period + subject code + room
    const timetable = [
      // B.Tech CS Year 1
      { id:1,  courseId:1, year:1, day:'Monday',    period:'9:00 - 10:00',  subjectCode:'CS101', subjectName:'Engineering Mathematics I', room:'A101', faculty:'Dr. Ramesh' },
      { id:2,  courseId:1, year:1, day:'Monday',    period:'10:00 - 11:00', subjectCode:'CS102', subjectName:'Programming in C',          room:'Lab1',  faculty:'Prof. Divya' },
      { id:3,  courseId:1, year:1, day:'Monday',    period:'11:15 - 12:15', subjectCode:'CS103', subjectName:'Digital Logic Design',      room:'A102', faculty:'Dr. Suresh' },
      { id:4,  courseId:1, year:1, day:'Tuesday',   period:'9:00 - 10:00',  subjectCode:'CS102', subjectName:'Programming in C',          room:'Lab1',  faculty:'Prof. Divya' },
      { id:5,  courseId:1, year:1, day:'Tuesday',   period:'10:00 - 11:00', subjectCode:'CS104', subjectName:'Engineering Physics',       room:'A103', faculty:'Dr. Meera' },
      { id:6,  courseId:1, year:1, day:'Wednesday', period:'9:00 - 10:00',  subjectCode:'CS103', subjectName:'Digital Logic Design',      room:'A102', faculty:'Dr. Suresh' },
      { id:7,  courseId:1, year:1, day:'Wednesday', period:'10:00 - 11:00', subjectCode:'CS105', subjectName:'Communication Skills',      room:'A104', faculty:'Ms. Lakshmi' },
      { id:8,  courseId:1, year:1, day:'Thursday',  period:'9:00 - 10:00',  subjectCode:'CS101', subjectName:'Engineering Mathematics I', room:'A101', faculty:'Dr. Ramesh' },
      { id:9,  courseId:1, year:1, day:'Thursday',  period:'10:00 - 11:00', subjectCode:'CS104', subjectName:'Engineering Physics',       room:'A103', faculty:'Dr. Meera' },
      { id:10, courseId:1, year:1, day:'Friday',    period:'9:00 - 10:00',  subjectCode:'CS102', subjectName:'Programming in C',          room:'Lab1',  faculty:'Prof. Divya' },
      { id:11, courseId:1, year:1, day:'Friday',    period:'10:00 - 11:00', subjectCode:'CS101', subjectName:'Engineering Mathematics I', room:'A101', faculty:'Dr. Ramesh' },
      // B.Tech CS Year 2
      { id:12, courseId:1, year:2, day:'Monday',    period:'9:00 - 10:00',  subjectCode:'CS201', subjectName:'Data Structures',             room:'B101', faculty:'Prof. Kiran' },
      { id:13, courseId:1, year:2, day:'Monday',    period:'10:00 - 11:00', subjectCode:'CS204', subjectName:'Object Oriented Programming', room:'Lab2',  faculty:'Dr. Anita' },
      { id:14, courseId:1, year:2, day:'Tuesday',   period:'9:00 - 10:00',  subjectCode:'CS205', subjectName:'Database Management Systems', room:'B102', faculty:'Prof. Raja' },
      { id:15, courseId:1, year:2, day:'Wednesday', period:'9:00 - 10:00',  subjectCode:'CS203', subjectName:'Discrete Mathematics',        room:'B103', faculty:'Dr. Priya' },
      // B.Tech CS Year 3
      { id:16, courseId:1, year:3, day:'Monday',    period:'9:00 - 10:00',  subjectCode:'CS301', subjectName:'Operating Systems',    room:'C101', faculty:'Dr. Venkat' },
      { id:17, courseId:1, year:3, day:'Tuesday',   period:'9:00 - 10:00',  subjectCode:'CS302', subjectName:'Computer Networks',    room:'C102', faculty:'Prof. Sridhar' },
      // B.Tech Electronics Year 1
      { id:18, courseId:2, year:1, day:'Monday',    period:'9:00 - 10:00',  subjectCode:'EC101', subjectName:'Basic Electronics',    room:'D101', faculty:'Dr. Kumar' },
      { id:19, courseId:2, year:1, day:'Tuesday',   period:'9:00 - 10:00',  subjectCode:'EC102', subjectName:'Circuit Theory',       room:'D102', faculty:'Prof. Nair' },
      { id:20, courseId:2, year:1, day:'Wednesday', period:'9:00 - 10:00',  subjectCode:'EC103', subjectName:'Engineering Mathematics', room:'D103', faculty:'Dr. Smitha' },
      // BBA Year 1
      { id:21, courseId:3, year:1, day:'Monday',    period:'9:00 - 10:00',  subjectCode:'BBA101', subjectName:'Principles of Management', room:'E101', faculty:'Prof. Jain' },
      { id:22, courseId:3, year:1, day:'Tuesday',   period:'9:00 - 10:00',  subjectCode:'BBA102', subjectName:'Business Communication',   room:'E102', faculty:'Ms. Sharma' },
    ];

    // ── Attendance ───────────────────────────────────────────
    // Per student, per subject, per date
    const attendance = [
      // Aarav Sharma (id:1) CS2301 CS Year 1
      { id:1,  studentId:1, subjectCode:'CS101', subjectName:'Engineering Mathematics I', date:'2023-08-07', status:'Present' },
      { id:2,  studentId:1, subjectCode:'CS101', subjectName:'Engineering Mathematics I', date:'2023-08-10', status:'Present' },
      { id:3,  studentId:1, subjectCode:'CS101', subjectName:'Engineering Mathematics I', date:'2023-08-14', status:'Absent'  },
      { id:4,  studentId:1, subjectCode:'CS101', subjectName:'Engineering Mathematics I', date:'2023-08-17', status:'Present' },
      { id:5,  studentId:1, subjectCode:'CS102', subjectName:'Programming in C',          date:'2023-08-07', status:'Present' },
      { id:6,  studentId:1, subjectCode:'CS102', subjectName:'Programming in C',          date:'2023-08-08', status:'Present' },
      { id:7,  studentId:1, subjectCode:'CS102', subjectName:'Programming in C',          date:'2023-08-10', status:'Absent'  },
      { id:8,  studentId:1, subjectCode:'CS102', subjectName:'Programming in C',          date:'2023-08-15', status:'Present' },
      { id:9,  studentId:1, subjectCode:'CS103', subjectName:'Digital Logic Design',      date:'2023-08-09', status:'Present' },
      { id:10, studentId:1, subjectCode:'CS103', subjectName:'Digital Logic Design',      date:'2023-08-16', status:'Present' },
      { id:11, studentId:1, subjectCode:'CS104', subjectName:'Engineering Physics',       date:'2023-08-08', status:'Present' },
      { id:12, studentId:1, subjectCode:'CS104', subjectName:'Engineering Physics',       date:'2023-08-11', status:'Absent'  },
      { id:13, studentId:1, subjectCode:'CS105', subjectName:'Communication Skills',      date:'2023-08-09', status:'Present' },
      { id:14, studentId:1, subjectCode:'CS105', subjectName:'Communication Skills',      date:'2023-08-16', status:'Present' },
      // Karan Singh (id:5) EC2301 Electronics Year 1
      { id:15, studentId:5, subjectCode:'EC101', subjectName:'Basic Electronics',         date:'2023-08-07', status:'Present' },
      { id:16, studentId:5, subjectCode:'EC101', subjectName:'Basic Electronics',         date:'2023-08-14', status:'Present' },
      { id:17, studentId:5, subjectCode:'EC101', subjectName:'Basic Electronics',         date:'2023-08-21', status:'Absent'  },
      { id:18, studentId:5, subjectCode:'EC102', subjectName:'Circuit Theory',            date:'2023-08-08', status:'Present' },
      { id:19, studentId:5, subjectCode:'EC102', subjectName:'Circuit Theory',            date:'2023-08-15', status:'Present' },
      { id:20, studentId:5, subjectCode:'EC103', subjectName:'Engineering Mathematics',   date:'2023-08-09', status:'Present' },
      { id:21, studentId:5, subjectCode:'EC103', subjectName:'Engineering Mathematics',   date:'2023-08-16', status:'Present' },
      { id:22, studentId:5, subjectCode:'EC104', subjectName:'Electronic Devices',        date:'2023-08-10', status:'Absent'  },
      { id:23, studentId:5, subjectCode:'EC104', subjectName:'Electronic Devices',        date:'2023-08-17', status:'Present' },
      // Rohan Mehta (id:3) CS Year 2
      { id:24, studentId:3, subjectCode:'CS201', subjectName:'Data Structures',             date:'2023-08-07', status:'Present' },
      { id:25, studentId:3, subjectCode:'CS201', subjectName:'Data Structures',             date:'2023-08-14', status:'Present' },
      { id:26, studentId:3, subjectCode:'CS204', subjectName:'Object Oriented Programming', date:'2023-08-07', status:'Absent'  },
      { id:27, studentId:3, subjectCode:'CS204', subjectName:'Object Oriented Programming', date:'2023-08-14', status:'Present' },
      { id:28, studentId:3, subjectCode:'CS205', subjectName:'Database Management Systems', date:'2023-08-08', status:'Present' },
      { id:29, studentId:3, subjectCode:'CS203', subjectName:'Discrete Mathematics',        date:'2023-08-09', status:'Present' },
    ];

    // ── Exam Results ─────────────────────────────────────────
    // Per student, per subject, with CIE (internal) and SEE (semester end) marks
    const examResults = [
      // Aarav Sharma (id:1)
      { id:1,  studentId:1, semester:'Sem 1', subjectCode:'CS101', subjectName:'Engineering Mathematics I', maxMarks:100, cieMarks:38, seeMarks:55, totalMarks:93,  grade:'A',  result:'Pass' },
      { id:2,  studentId:1, semester:'Sem 1', subjectCode:'CS102', subjectName:'Programming in C',          maxMarks:100, cieMarks:40, seeMarks:52, totalMarks:92,  grade:'A',  result:'Pass' },
      { id:3,  studentId:1, semester:'Sem 1', subjectCode:'CS103', subjectName:'Digital Logic Design',      maxMarks:100, cieMarks:35, seeMarks:48, totalMarks:83,  grade:'B',  result:'Pass' },
      { id:4,  studentId:1, semester:'Sem 1', subjectCode:'CS104', subjectName:'Engineering Physics',       maxMarks:100, cieMarks:30, seeMarks:42, totalMarks:72,  grade:'C',  result:'Pass' },
      { id:5,  studentId:1, semester:'Sem 1', subjectCode:'CS105', subjectName:'Communication Skills',      maxMarks:100, cieMarks:42, seeMarks:50, totalMarks:92,  grade:'A',  result:'Pass' },
      // Karan Singh (id:5)
      { id:6,  studentId:5, semester:'Sem 1', subjectCode:'EC101', subjectName:'Basic Electronics',         maxMarks:100, cieMarks:36, seeMarks:50, totalMarks:86,  grade:'A',  result:'Pass' },
      { id:7,  studentId:5, semester:'Sem 1', subjectCode:'EC102', subjectName:'Circuit Theory',            maxMarks:100, cieMarks:33, seeMarks:44, totalMarks:77,  grade:'B',  result:'Pass' },
      { id:8,  studentId:5, semester:'Sem 1', subjectCode:'EC103', subjectName:'Engineering Mathematics',   maxMarks:100, cieMarks:28, seeMarks:38, totalMarks:66,  grade:'C',  result:'Pass' },
      { id:9,  studentId:5, semester:'Sem 1', subjectCode:'EC104', subjectName:'Electronic Devices',        maxMarks:100, cieMarks:40, seeMarks:56, totalMarks:96,  grade:'O',  result:'Pass' },
      // Rohan Mehta (id:3) Sem 2 (year 2)
      { id:10, studentId:3, semester:'Sem 3', subjectCode:'CS201', subjectName:'Data Structures',             maxMarks:100, cieMarks:39, seeMarks:54, totalMarks:93,  grade:'A',  result:'Pass' },
      { id:11, studentId:3, semester:'Sem 3', subjectCode:'CS202', subjectName:'Computer Organisation',       maxMarks:100, cieMarks:31, seeMarks:40, totalMarks:71,  grade:'C',  result:'Pass' },
      { id:12, studentId:3, semester:'Sem 3', subjectCode:'CS203', subjectName:'Discrete Mathematics',        maxMarks:100, cieMarks:25, seeMarks:30, totalMarks:55,  grade:'D',  result:'Pass' },
      { id:13, studentId:3, semester:'Sem 3', subjectCode:'CS204', subjectName:'Object Oriented Programming', maxMarks:100, cieMarks:38, seeMarks:50, totalMarks:88,  grade:'A',  result:'Pass' },
      // Priya Patel (id:2)
      { id:14, studentId:2, semester:'Sem 1', subjectCode:'CS101', subjectName:'Engineering Mathematics I', maxMarks:100, cieMarks:35, seeMarks:46, totalMarks:81,  grade:'B',  result:'Pass' },
      { id:15, studentId:2, semester:'Sem 1', subjectCode:'CS102', subjectName:'Programming in C',          maxMarks:100, cieMarks:42, seeMarks:55, totalMarks:97,  grade:'O',  result:'Pass' },
      { id:16, studentId:2, semester:'Sem 1', subjectCode:'CS103', subjectName:'Digital Logic Design',      maxMarks:100, cieMarks:20, seeMarks:25, totalMarks:45,  grade:'F',  result:'Fail' },
    ];

    save(KEYS.courseSubjects, courseSubjects);
    save(KEYS.timetable, timetable);
    save(KEYS.attendance, attendance);
    save(KEYS.examResults, examResults);
    localStorage.setItem('cfms_seeded', 'v2');
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

  // ── COURSE SUBJECTS ──────────────────────────────────────
  const CourseSubjects = {
    all: () => load(KEYS.courseSubjects),
    get: (id) => load(KEYS.courseSubjects).find(s => s.id === id),
    byCourseYear: (courseId, year) => load(KEYS.courseSubjects).filter(s => s.courseId === courseId && s.year === parseInt(year)),
    add: (data) => {
      const arr = load(KEYS.courseSubjects);
      const item = { ...data, id: nextId(arr) };
      arr.push(item); save(KEYS.courseSubjects, arr); return item;
    },
    update: (id, data) => {
      const arr = load(KEYS.courseSubjects).map(s => s.id === id ? { ...s, ...data } : s);
      save(KEYS.courseSubjects, arr);
    },
    delete: (id) => {
      save(KEYS.courseSubjects, load(KEYS.courseSubjects).filter(s => s.id !== id));
    },
  };

  // ── TIMETABLE ────────────────────────────────────────────
  const Timetable = {
    all: () => load(KEYS.timetable),
    get: (id) => load(KEYS.timetable).find(t => t.id === id),
    byCourseYear: (courseId, year) => load(KEYS.timetable).filter(t => t.courseId === courseId && t.year === parseInt(year)),
    add: (data) => {
      const arr = load(KEYS.timetable);
      const item = { ...data, id: nextId(arr) };
      arr.push(item); save(KEYS.timetable, arr); return item;
    },
    update: (id, data) => {
      const arr = load(KEYS.timetable).map(t => t.id === id ? { ...t, ...data } : t);
      save(KEYS.timetable, arr);
    },
    delete: (id) => {
      save(KEYS.timetable, load(KEYS.timetable).filter(t => t.id !== id));
    },
  };

  // ── ATTENDANCE ───────────────────────────────────────────
  const Attendance = {
    all: () => load(KEYS.attendance),
    get: (id) => load(KEYS.attendance).find(a => a.id === id),
    byStudent: (studentId) => load(KEYS.attendance).filter(a => a.studentId === studentId),
    // Returns { present, absent, total, pct } grouped by subjectCode for a student
    summaryByStudent: (studentId) => {
      const recs = load(KEYS.attendance).filter(a => a.studentId === studentId);
      const map = {};
      recs.forEach(a => {
        if (!map[a.subjectCode]) map[a.subjectCode] = { subjectCode: a.subjectCode, subjectName: a.subjectName, present: 0, absent: 0 };
        if (a.status === 'Present') map[a.subjectCode].present++;
        else map[a.subjectCode].absent++;
      });
      return Object.values(map).map(s => ({ ...s, total: s.present + s.absent, pct: s.present + s.absent > 0 ? Math.round((s.present / (s.present + s.absent)) * 100) : 0 }));
    },
    add: (data) => {
      const arr = load(KEYS.attendance);
      const item = { ...data, id: nextId(arr) };
      arr.push(item); save(KEYS.attendance, arr); return item;
    },
    update: (id, data) => {
      const arr = load(KEYS.attendance).map(a => a.id === id ? { ...a, ...data } : a);
      save(KEYS.attendance, arr);
    },
    delete: (id) => {
      save(KEYS.attendance, load(KEYS.attendance).filter(a => a.id !== id));
    },
    // Bulk-upsert: add attendance for multiple students at once (used by admin mark-attendance)
    bulkMark: (records) => {
      const arr = load(KEYS.attendance);
      records.forEach(r => {
        const existing = arr.find(a => a.studentId === r.studentId && a.subjectCode === r.subjectCode && a.date === r.date);
        if (existing) { existing.status = r.status; }
        else { arr.push({ ...r, id: nextId(arr) }); }
      });
      save(KEYS.attendance, arr);
    },
  };

  // ── EXAM RESULTS ─────────────────────────────────────────
  const ExamResults = {
    all: () => load(KEYS.examResults),
    get: (id) => load(KEYS.examResults).find(r => r.id === id),
    byStudent: (studentId) => load(KEYS.examResults).filter(r => r.studentId === studentId),
    add: (data) => {
      const arr = load(KEYS.examResults);
      const item = { ...data, id: nextId(arr) };
      arr.push(item); save(KEYS.examResults, arr); return item;
    },
    update: (id, data) => {
      const arr = load(KEYS.examResults).map(r => r.id === id ? { ...r, ...data } : r);
      save(KEYS.examResults, arr);
    },
    delete: (id) => {
      save(KEYS.examResults, load(KEYS.examResults).filter(r => r.id !== id));
    },
  };

  return { seed, Courses, FeeStructures, Students, Payments, Stats, CourseSubjects, Timetable, Attendance, ExamResults };
})();
