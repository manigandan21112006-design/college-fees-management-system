-- ============================================================
--  College Fees Management System — Supabase Schema
--  Run this entire file in Supabase SQL Editor
--  Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- ── COURSES ─────────────────────────────────────────────────
create table if not exists courses (
  id          serial primary key,
  name        text not null,
  duration    int  not null default 3,
  department  text not null
);

-- ── FEE STRUCTURES ───────────────────────────────────────────
create table if not exists fee_structures (
  id           serial primary key,
  course_id    int  references courses(id) on delete cascade,
  year         int  not null,
  tuition_fee  int  not null default 0,
  exam_fee     int  not null default 0,
  library_fee  int  not null default 0,
  lab_fee      int  not null default 0,
  other_fee    int  not null default 0,
  total        int  not null default 0
);

-- ── STUDENTS ─────────────────────────────────────────────────
create table if not exists students (
  id              serial primary key,
  roll_no         text not null unique,
  name            text not null,
  email           text,
  phone           text,
  dob             date,
  gender          text,
  address         text,
  course_id       int  references courses(id) on delete set null,
  year            int  not null default 1,
  status          text not null default 'Active',
  admission_date  date
);

-- ── PAYMENTS ─────────────────────────────────────────────────
create table if not exists payments (
  id                serial primary key,
  student_id        int  references students(id) on delete cascade,
  fee_structure_id  int  references fee_structures(id) on delete set null,
  amount            int  not null default 0,
  paid_amount       int  not null default 0,
  payment_date      date,
  method            text,
  receipt_no        text,
  status            text not null default 'Pending',
  remark            text
);

-- ── COURSE SUBJECTS ──────────────────────────────────────────
create table if not exists course_subjects (
  id         serial primary key,
  course_id  int  references courses(id) on delete cascade,
  year       int  not null,
  code       text not null,
  name       text not null,
  credits    int  not null default 3
);

-- ── TIMETABLE ────────────────────────────────────────────────
create table if not exists timetable (
  id            serial primary key,
  course_id     int  references courses(id) on delete cascade,
  year          int  not null,
  day           text not null,
  period        text not null,
  subject_code  text not null,
  subject_name  text not null,
  room          text,
  faculty       text
);

-- ── ATTENDANCE ───────────────────────────────────────────────
create table if not exists attendance (
  id            serial primary key,
  student_id    int  references students(id) on delete cascade,
  subject_code  text not null,
  subject_name  text not null,
  date          date not null,
  status        text not null default 'Present',
  unique(student_id, subject_code, date)
);

-- ── EXAM RESULTS ─────────────────────────────────────────────
create table if not exists exam_results (
  id            serial primary key,
  student_id    int  references students(id) on delete cascade,
  semester      text not null,
  subject_code  text not null,
  subject_name  text not null,
  max_marks     int  not null default 100,
  cie_marks     int  not null default 0,
  see_marks     int  not null default 0,
  total_marks   int  not null default 0,
  grade         text,
  result        text
);

-- ── DISABLE ROW LEVEL SECURITY (simple open access) ─────────
alter table courses          disable row level security;
alter table fee_structures   disable row level security;
alter table students         disable row level security;
alter table payments         disable row level security;
alter table course_subjects  disable row level security;
alter table timetable        disable row level security;
alter table attendance       disable row level security;
alter table exam_results     disable row level security;

-- ── GRANT API ACCESS (required after Oct 30, 2025) ───────────
-- These grants ensure the anon key can read/write all tables
-- even after Supabase stops auto-granting access to new tables.

grant select, insert, update, delete on public.courses          to anon;
grant select, insert, update, delete on public.fee_structures   to anon;
grant select, insert, update, delete on public.students         to anon;
grant select, insert, update, delete on public.payments         to anon;
grant select, insert, update, delete on public.course_subjects  to anon;
grant select, insert, update, delete on public.timetable        to anon;
grant select, insert, update, delete on public.attendance       to anon;
grant select, insert, update, delete on public.exam_results     to anon;

grant select, insert, update, delete on public.courses          to authenticated;
grant select, insert, update, delete on public.fee_structures   to authenticated;
grant select, insert, update, delete on public.students         to authenticated;
grant select, insert, update, delete on public.payments         to authenticated;
grant select, insert, update, delete on public.course_subjects  to authenticated;
grant select, insert, update, delete on public.timetable        to authenticated;
grant select, insert, update, delete on public.attendance       to authenticated;
grant select, insert, update, delete on public.exam_results     to authenticated;

-- ── SEED DATA ────────────────────────────────────────────────

-- Courses
insert into courses (id, name, duration, department) values
  (1, 'B.Tech Computer Science', 4, 'Engineering'),
  (2, 'B.Tech Electronics',       4, 'Engineering'),
  (3, 'BBA',                       3, 'Management'),
  (4, 'B.Sc Physics',              3, 'Science'),
  (5, 'B.Com',                     3, 'Commerce')
on conflict (id) do nothing;

-- Reset sequence
select setval('courses_id_seq', (select max(id) from courses));

-- Fee Structures
insert into fee_structures (id, course_id, year, tuition_fee, exam_fee, library_fee, lab_fee, other_fee, total) values
  (1, 1, 1, 85000, 2500, 1500, 5000, 2000, 96000),
  (2, 1, 2, 85000, 2500, 1500, 5000, 2000, 96000),
  (3, 1, 3, 90000, 2500, 1500, 6000, 2000, 102000),
  (4, 1, 4, 90000, 2500, 1500, 6000, 2000, 102000),
  (5, 2, 1, 80000, 2500, 1500, 4500, 2000, 90500),
  (6, 3, 1, 55000, 2000, 1000, 0,    1500, 59500),
  (7, 4, 1, 45000, 2000, 1000, 3000, 1000, 52000),
  (8, 5, 1, 40000, 2000, 1000, 0,    1000, 44000)
on conflict (id) do nothing;

select setval('fee_structures_id_seq', (select max(id) from fee_structures));

-- Students
insert into students (id, roll_no, name, email, phone, dob, gender, address, course_id, year, status, admission_date) values
  (1,  'CS2301',  'Aarav Sharma',  'aarav@college.edu',   '9876543210', '2005-03-12', 'Male',   'Mumbai',  1, 1, 'Active',   '2023-07-15'),
  (2,  'CS2302',  'Priya Patel',   'priya@college.edu',   '9876543211', '2005-06-22', 'Female', 'Delhi',   1, 1, 'Active',   '2023-07-15'),
  (3,  'CS2201',  'Rohan Mehta',   'rohan@college.edu',   '9876543212', '2004-01-30', 'Male',   'Pune',    1, 2, 'Active',   '2022-07-10'),
  (4,  'CS2202',  'Sneha Gupta',   'sneha@college.edu',   '9876543213', '2004-09-14', 'Female', 'Surat',   1, 2, 'Active',   '2022-07-10'),
  (5,  'EC2301',  'Karan Singh',   'karan@college.edu',   '9876543214', '2005-11-05', 'Male',   'Jaipur',  2, 1, 'Active',   '2023-07-15'),
  (6,  'BBA2301', 'Anjali Verma',  'anjali@college.edu',  '9876543215', '2005-02-18', 'Female', 'Indore',  3, 1, 'Active',   '2023-07-20'),
  (7,  'PH2301',  'Vikram Nair',   'vikram@college.edu',  '9876543216', '2005-07-25', 'Male',   'Kochi',   4, 1, 'Active',   '2023-07-18'),
  (8,  'COM2301', 'Neha Joshi',    'neha@college.edu',    '9876543217', '2005-04-09', 'Female', 'Nagpur',  5, 1, 'Inactive', '2023-07-15'),
  (9,  'CS2101',  'Arjun Reddy',   'arjun@college.edu',   '9876543218', '2003-12-01', 'Male',   'Hyd',     1, 3, 'Active',   '2021-07-12'),
  (10, 'CS2102',  'Deepika Rao',   'deepika@college.edu', '9876543219', '2003-08-17', 'Female', 'Chennai', 1, 3, 'Active',   '2021-07-12')
on conflict (id) do nothing;

select setval('students_id_seq', (select max(id) from students));

-- Payments
insert into payments (id, student_id, fee_structure_id, amount, paid_amount, payment_date, method, receipt_no, status, remark) values
  (1, 1,  1, 96000,  96000,  '2023-08-01', 'Online', 'RCP001', 'Paid',    ''),
  (2, 2,  1, 96000,  50000,  '2023-08-05', 'Cash',   'RCP002', 'Partial', 'Instalment 1'),
  (3, 3,  2, 96000,  96000,  '2023-08-02', 'Cheque', 'RCP003', 'Paid',    ''),
  (4, 4,  2, 96000,  0,      null,          '',       '',       'Pending', ''),
  (5, 5,  5, 90500,  90500,  '2023-08-03', 'Online', 'RCP005', 'Paid',    ''),
  (6, 6,  6, 59500,  30000,  '2023-08-10', 'Cash',   'RCP006', 'Partial', 'Instalment 1'),
  (7, 7,  7, 52000,  52000,  '2023-08-07', 'Online', 'RCP007', 'Paid',    ''),
  (8, 9,  3, 102000, 102000, '2023-08-01', 'Online', 'RCP008', 'Paid',    ''),
  (9, 10, 3, 102000, 75000,  '2023-08-04', 'Cheque', 'RCP009', 'Partial', 'Balance due')
on conflict (id) do nothing;

select setval('payments_id_seq', (select max(id) from payments));

-- Course Subjects
insert into course_subjects (id, course_id, year, code, name, credits) values
  (1,  1, 1, 'CS101',  'Engineering Mathematics I',   4),
  (2,  1, 1, 'CS102',  'Programming in C',            4),
  (3,  1, 1, 'CS103',  'Digital Logic Design',        3),
  (4,  1, 1, 'CS104',  'Engineering Physics',         3),
  (5,  1, 1, 'CS105',  'Communication Skills',        2),
  (6,  1, 2, 'CS201',  'Data Structures',             4),
  (7,  1, 2, 'CS202',  'Computer Organisation',       3),
  (8,  1, 2, 'CS203',  'Discrete Mathematics',        3),
  (9,  1, 2, 'CS204',  'Object Oriented Programming', 4),
  (10, 1, 2, 'CS205',  'Database Management Systems', 4),
  (11, 1, 3, 'CS301',  'Operating Systems',           4),
  (12, 1, 3, 'CS302',  'Computer Networks',           4),
  (13, 1, 3, 'CS303',  'Algorithm Design',            3),
  (14, 2, 1, 'EC101',  'Basic Electronics',           4),
  (15, 2, 1, 'EC102',  'Circuit Theory',              4),
  (16, 2, 1, 'EC103',  'Engineering Mathematics',     3),
  (17, 2, 1, 'EC104',  'Electronic Devices',          3),
  (18, 3, 1, 'BBA101', 'Principles of Management',    4),
  (19, 3, 1, 'BBA102', 'Business Communication',      3),
  (20, 3, 1, 'BBA103', 'Financial Accounting',        4),
  (21, 4, 1, 'PH101',  'Mechanics',                   4),
  (22, 4, 1, 'PH102',  'Thermodynamics',              3),
  (23, 4, 1, 'PH103',  'Optics',                      3),
  (24, 5, 1, 'COM101', 'Business Economics',          3),
  (25, 5, 1, 'COM102', 'Accountancy',                 4)
on conflict (id) do nothing;

select setval('course_subjects_id_seq', (select max(id) from course_subjects));

-- Timetable
insert into timetable (id, course_id, year, day, period, subject_code, subject_name, room, faculty) values
  (1,  1, 1, 'Monday',    '9:00 - 10:00',  'CS101',  'Engineering Mathematics I', 'A101', 'Dr. Ramesh'),
  (2,  1, 1, 'Monday',    '10:00 - 11:00', 'CS102',  'Programming in C',          'Lab1', 'Prof. Divya'),
  (3,  1, 1, 'Monday',    '11:15 - 12:15', 'CS103',  'Digital Logic Design',      'A102', 'Dr. Suresh'),
  (4,  1, 1, 'Tuesday',   '9:00 - 10:00',  'CS102',  'Programming in C',          'Lab1', 'Prof. Divya'),
  (5,  1, 1, 'Tuesday',   '10:00 - 11:00', 'CS104',  'Engineering Physics',       'A103', 'Dr. Meera'),
  (6,  1, 1, 'Wednesday', '9:00 - 10:00',  'CS103',  'Digital Logic Design',      'A102', 'Dr. Suresh'),
  (7,  1, 1, 'Wednesday', '10:00 - 11:00', 'CS105',  'Communication Skills',      'A104', 'Ms. Lakshmi'),
  (8,  1, 1, 'Thursday',  '9:00 - 10:00',  'CS101',  'Engineering Mathematics I', 'A101', 'Dr. Ramesh'),
  (9,  1, 1, 'Thursday',  '10:00 - 11:00', 'CS104',  'Engineering Physics',       'A103', 'Dr. Meera'),
  (10, 1, 1, 'Friday',    '9:00 - 10:00',  'CS102',  'Programming in C',          'Lab1', 'Prof. Divya'),
  (11, 1, 1, 'Friday',    '10:00 - 11:00', 'CS101',  'Engineering Mathematics I', 'A101', 'Dr. Ramesh'),
  (12, 1, 2, 'Monday',    '9:00 - 10:00',  'CS201',  'Data Structures',           'B101', 'Prof. Kiran'),
  (13, 1, 2, 'Monday',    '10:00 - 11:00', 'CS204',  'Object Oriented Programming','Lab2','Dr. Anita'),
  (14, 1, 2, 'Tuesday',   '9:00 - 10:00',  'CS205',  'Database Management Systems','B102','Prof. Raja'),
  (15, 1, 2, 'Wednesday', '9:00 - 10:00',  'CS203',  'Discrete Mathematics',      'B103', 'Dr. Priya'),
  (16, 1, 3, 'Monday',    '9:00 - 10:00',  'CS301',  'Operating Systems',         'C101', 'Dr. Venkat'),
  (17, 1, 3, 'Tuesday',   '9:00 - 10:00',  'CS302',  'Computer Networks',         'C102', 'Prof. Sridhar'),
  (18, 2, 1, 'Monday',    '9:00 - 10:00',  'EC101',  'Basic Electronics',         'D101', 'Dr. Kumar'),
  (19, 2, 1, 'Tuesday',   '9:00 - 10:00',  'EC102',  'Circuit Theory',            'D102', 'Prof. Nair'),
  (20, 2, 1, 'Wednesday', '9:00 - 10:00',  'EC103',  'Engineering Mathematics',   'D103', 'Dr. Smitha'),
  (21, 3, 1, 'Monday',    '9:00 - 10:00',  'BBA101', 'Principles of Management',  'E101', 'Prof. Jain'),
  (22, 3, 1, 'Tuesday',   '9:00 - 10:00',  'BBA102', 'Business Communication',    'E102', 'Ms. Sharma')
on conflict (id) do nothing;

select setval('timetable_id_seq', (select max(id) from timetable));

-- Attendance
insert into attendance (id, student_id, subject_code, subject_name, date, status) values
  (1,  1, 'CS101', 'Engineering Mathematics I', '2023-08-07', 'Present'),
  (2,  1, 'CS101', 'Engineering Mathematics I', '2023-08-10', 'Present'),
  (3,  1, 'CS101', 'Engineering Mathematics I', '2023-08-14', 'Absent'),
  (4,  1, 'CS101', 'Engineering Mathematics I', '2023-08-17', 'Present'),
  (5,  1, 'CS102', 'Programming in C',          '2023-08-07', 'Present'),
  (6,  1, 'CS102', 'Programming in C',          '2023-08-08', 'Present'),
  (7,  1, 'CS102', 'Programming in C',          '2023-08-10', 'Absent'),
  (8,  1, 'CS102', 'Programming in C',          '2023-08-15', 'Present'),
  (9,  1, 'CS103', 'Digital Logic Design',      '2023-08-09', 'Present'),
  (10, 1, 'CS103', 'Digital Logic Design',      '2023-08-16', 'Present'),
  (11, 1, 'CS104', 'Engineering Physics',       '2023-08-08', 'Present'),
  (12, 1, 'CS104', 'Engineering Physics',       '2023-08-11', 'Absent'),
  (13, 1, 'CS105', 'Communication Skills',      '2023-08-09', 'Present'),
  (14, 1, 'CS105', 'Communication Skills',      '2023-08-16', 'Present'),
  (15, 5, 'EC101', 'Basic Electronics',         '2023-08-07', 'Present'),
  (16, 5, 'EC101', 'Basic Electronics',         '2023-08-14', 'Present'),
  (17, 5, 'EC101', 'Basic Electronics',         '2023-08-21', 'Absent'),
  (18, 5, 'EC102', 'Circuit Theory',            '2023-08-08', 'Present'),
  (19, 5, 'EC102', 'Circuit Theory',            '2023-08-15', 'Present'),
  (20, 5, 'EC103', 'Engineering Mathematics',   '2023-08-09', 'Present'),
  (21, 5, 'EC103', 'Engineering Mathematics',   '2023-08-16', 'Present'),
  (22, 5, 'EC104', 'Electronic Devices',        '2023-08-10', 'Absent'),
  (23, 5, 'EC104', 'Electronic Devices',        '2023-08-17', 'Present'),
  (24, 3, 'CS201', 'Data Structures',             '2023-08-07', 'Present'),
  (25, 3, 'CS201', 'Data Structures',             '2023-08-14', 'Present'),
  (26, 3, 'CS204', 'Object Oriented Programming', '2023-08-07', 'Absent'),
  (27, 3, 'CS204', 'Object Oriented Programming', '2023-08-14', 'Present'),
  (28, 3, 'CS205', 'Database Management Systems', '2023-08-08', 'Present'),
  (29, 3, 'CS203', 'Discrete Mathematics',        '2023-08-09', 'Present')
on conflict (student_id, subject_code, date) do nothing;

select setval('attendance_id_seq', (select max(id) from attendance));

-- Exam Results
insert into exam_results (id, student_id, semester, subject_code, subject_name, max_marks, cie_marks, see_marks, total_marks, grade, result) values
  (1,  1, 'Sem 1', 'CS101', 'Engineering Mathematics I',   100, 38, 55, 93, 'A',  'Pass'),
  (2,  1, 'Sem 1', 'CS102', 'Programming in C',            100, 40, 52, 92, 'A',  'Pass'),
  (3,  1, 'Sem 1', 'CS103', 'Digital Logic Design',        100, 35, 48, 83, 'B',  'Pass'),
  (4,  1, 'Sem 1', 'CS104', 'Engineering Physics',         100, 30, 42, 72, 'C',  'Pass'),
  (5,  1, 'Sem 1', 'CS105', 'Communication Skills',        100, 42, 50, 92, 'A',  'Pass'),
  (6,  5, 'Sem 1', 'EC101', 'Basic Electronics',           100, 36, 50, 86, 'A',  'Pass'),
  (7,  5, 'Sem 1', 'EC102', 'Circuit Theory',              100, 33, 44, 77, 'B',  'Pass'),
  (8,  5, 'Sem 1', 'EC103', 'Engineering Mathematics',     100, 28, 38, 66, 'C',  'Pass'),
  (9,  5, 'Sem 1', 'EC104', 'Electronic Devices',          100, 40, 56, 96, 'O',  'Pass'),
  (10, 3, 'Sem 3', 'CS201', 'Data Structures',             100, 39, 54, 93, 'A',  'Pass'),
  (11, 3, 'Sem 3', 'CS202', 'Computer Organisation',       100, 31, 40, 71, 'C',  'Pass'),
  (12, 3, 'Sem 3', 'CS203', 'Discrete Mathematics',        100, 25, 30, 55, 'D',  'Pass'),
  (13, 3, 'Sem 3', 'CS204', 'Object Oriented Programming', 100, 38, 50, 88, 'A',  'Pass'),
  (14, 2, 'Sem 1', 'CS101', 'Engineering Mathematics I',   100, 35, 46, 81, 'B',  'Pass'),
  (15, 2, 'Sem 1', 'CS102', 'Programming in C',            100, 42, 55, 97, 'O',  'Pass'),
  (16, 2, 'Sem 1', 'CS103', 'Digital Logic Design',        100, 20, 25, 45, 'F',  'Fail')
on conflict (id) do nothing;

select setval('exam_results_id_seq', (select max(id) from exam_results));
