import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'university.db');

const db = new Database(dbPath);

export function initDb() {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS Departments (
      dept_id INTEGER PRIMARY KEY AUTOINCREMENT,
      dept_name TEXT NOT NULL UNIQUE,
      hod_name TEXT,
      location TEXT
    );

    CREATE TABLE IF NOT EXISTS Students (
      student_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      dob TEXT,
      gender TEXT CHECK(gender IN ('M', 'F', 'O')),
      dept_id INTEGER NOT NULL,
      semester INTEGER NOT NULL DEFAULT 1 CHECK(semester BETWEEN 1 AND 8),
      FOREIGN KEY (dept_id) REFERENCES Departments(dept_id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS Courses (
      course_id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_code TEXT NOT NULL UNIQUE,
      course_name TEXT NOT NULL,
      credits INTEGER NOT NULL DEFAULT 3 CHECK(credits BETWEEN 1 AND 6),
      dept_id INTEGER NOT NULL,
      is_elective INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (dept_id) REFERENCES Departments(dept_id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS Enrollments (
      enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      semester INTEGER NOT NULL CHECK(semester BETWEEN 1 AND 8),
      marks REAL DEFAULT NULL CHECK(marks IS NULL OR (marks >= 0 AND marks <= 100)),
      academic_year TEXT NOT NULL DEFAULT '2025-26',
      UNIQUE(student_id, course_id, semester, academic_year),
      FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Audit_Log (
      log_id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      action_type TEXT NOT NULL,
      record_id INTEGER NOT NULL,
      changed_by TEXT DEFAULT 'system',
      change_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      description TEXT
    );
  `);

  // Create Triggers
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS trg_enrollment_insert
    AFTER INSERT ON Enrollments
    BEGIN
        INSERT INTO Audit_Log (table_name, action_type, record_id, description)
        VALUES (
            'Enrollments',
            'INSERT',
            NEW.enrollment_id,
            'Student ' || NEW.student_id || ' enrolled in course ' || NEW.course_id || ' — Sem ' || NEW.semester || ' (' || NEW.academic_year || ')'
        );
    END;

    CREATE TRIGGER IF NOT EXISTS trg_enrollment_update
    AFTER UPDATE ON Enrollments
    WHEN OLD.marks IS NOT NEW.marks OR (OLD.marks IS NULL AND NEW.marks IS NOT NULL) OR (OLD.marks IS NOT NULL AND NEW.marks IS NULL)
    BEGIN
        INSERT INTO Audit_Log (table_name, action_type, record_id, description)
        VALUES (
            'Enrollments',
            'UPDATE',
            NEW.enrollment_id,
            'Marks updated for enrollment ' || NEW.enrollment_id || ': ' || IFNULL(OLD.marks, 'NULL') || ' -> ' || IFNULL(NEW.marks, 'NULL')
        );
    END;

    CREATE TRIGGER IF NOT EXISTS trg_student_insert
    AFTER INSERT ON Students
    BEGIN
        INSERT INTO Audit_Log (table_name, action_type, record_id, description)
        VALUES (
            'Students',
            'INSERT',
            NEW.student_id,
            'New student admitted: ' || NEW.first_name || ' ' || NEW.last_name || ' | Dept: ' || NEW.dept_id || ' | Sem: ' || NEW.semester
        );
    END;
  `);

  // Create Views
  db.exec(`
    CREATE VIEW IF NOT EXISTS vw_dept_student_strength AS
    SELECT
        d.dept_id,
        d.dept_name,
        d.hod_name,
        COUNT(s.student_id) AS total_students,
        SUM(CASE WHEN s.gender = 'M' THEN 1 ELSE 0 END) AS male_count,
        SUM(CASE WHEN s.gender = 'F' THEN 1 ELSE 0 END) AS female_count
    FROM Departments d
    LEFT JOIN Students s ON d.dept_id = s.dept_id
    GROUP BY d.dept_id, d.dept_name, d.hod_name;

    CREATE VIEW IF NOT EXISTS vw_dept_sem_strength AS
    SELECT
        d.dept_name,
        s.semester,
        COUNT(s.student_id) AS students
    FROM Departments d
    JOIN Students s ON d.dept_id = s.dept_id
    GROUP BY d.dept_name, s.semester
    ORDER BY d.dept_name, s.semester;
  `);

  // Seed Data if empty
  const deptCount = db.prepare('SELECT COUNT(*) as count FROM Departments').get() as { count: number };
  if (deptCount.count === 0) {
    const insertDept = db.prepare('INSERT INTO Departments (dept_name, hod_name, location) VALUES (?, ?, ?)');
    insertDept.run('Computer Science and Engineering', 'Dr. Anita Rao', 'Block A');
    insertDept.run('Electronics and Communication', 'Dr. Ravi Kumar', 'Block B');
    insertDept.run('Mechanical Engineering', 'Dr. Priya Shetty', 'Block C');

    const insertStudent = db.prepare('INSERT INTO Students (first_name, last_name, email, phone, dob, gender, dept_id, semester) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    insertStudent.run('Rahul', 'Sharma', 'rahul.sharma@cmr.edu.in', '9876543210', '2004-03-12', 'M', 1, 4);
    insertStudent.run('Priya', 'Nair', 'priya.nair@cmr.edu.in', '9876543211', '2004-07-22', 'F', 1, 4);
    insertStudent.run('Aditya', 'Verma', 'aditya.verma@cmr.edu.in', '9876543212', '2003-11-05', 'M', 2, 6);
    insertStudent.run('Sneha', 'Patel', 'sneha.patel@cmr.edu.in', '9876543213', '2005-01-18', 'F', 1, 2);
    insertStudent.run('Kiran', 'Reddy', 'kiran.reddy@cmr.edu.in', '9876543214', '2003-06-30', 'M', 3, 6);
    insertStudent.run('Meghna', 'Das', 'meghna.das@cmr.edu.in', '9876543215', '2004-09-14', 'F', 2, 4);
    insertStudent.run('Arjun', 'Menon', 'arjun.menon@cmr.edu.in', '9876543216', '2005-04-02', 'M', 1, 2);
    insertStudent.run('Divya', 'Joshi', 'divya.joshi@cmr.edu.in', '9876543217', '2004-12-25', 'F', 3, 4);

    const insertCourse = db.prepare('INSERT INTO Courses (course_code, course_name, credits, dept_id, is_elective) VALUES (?, ?, ?, ?, ?)');
    insertCourse.run('CS401', 'Database Management Systems', 4, 1, 0);
    insertCourse.run('CS402', 'Operating Systems', 4, 1, 0);
    insertCourse.run('CS403', 'Computer Networks', 3, 1, 0);
    insertCourse.run('CS301', 'Data Structures and Algorithms', 4, 1, 0);
    insertCourse.run('EC401', 'VLSI Design', 3, 2, 0);
    insertCourse.run('EC402', 'Digital Signal Processing', 3, 2, 0);
    insertCourse.run('ME401', 'Thermodynamics', 4, 3, 0);
    insertCourse.run('CS501', 'Machine Learning', 3, 1, 1);

    const insertEnrollment = db.prepare('INSERT INTO Enrollments (student_id, course_id, semester, marks, academic_year) VALUES (?, ?, ?, ?, ?)');
    insertEnrollment.run(1, 1, 4, 82.5, '2024-25');
    insertEnrollment.run(1, 2, 4, 76.0, '2024-25');
    insertEnrollment.run(1, 3, 4, 91.0, '2024-25');
    insertEnrollment.run(2, 1, 4, 88.5, '2024-25');
    insertEnrollment.run(2, 2, 4, 55.0, '2024-25');
    insertEnrollment.run(2, 3, 4, 43.0, '2024-25');
    insertEnrollment.run(3, 5, 6, 95.0, '2024-25');
    insertEnrollment.run(3, 6, 6, 78.5, '2024-25');
    insertEnrollment.run(4, 4, 2, 62.0, '2024-25');
    insertEnrollment.run(5, 7, 6, 71.0, '2024-25');
    insertEnrollment.run(6, 5, 4, 85.0, '2024-25');
    insertEnrollment.run(6, 6, 4, 67.5, '2024-25');
    insertEnrollment.run(7, 4, 2, 90.0, '2024-25');
    insertEnrollment.run(8, 7, 4, 59.0, '2024-25');
  }
}

export function getGrade(marks: number | null): string {
  if (marks === null) return 'NA';
  if (marks >= 90) return 'O';
  if (marks >= 80) return 'A+';
  if (marks >= 70) return 'A';
  if (marks >= 60) return 'B+';
  if (marks >= 50) return 'B';
  if (marks >= 40) return 'C';
  return 'F';
}

export function getGradePoints(grade: string): number {
  switch (grade) {
    case 'O': return 10.0;
    case 'A+': return 9.0;
    case 'A': return 8.0;
    case 'B+': return 7.0;
    case 'B': return 6.0;
    case 'C': return 5.0;
    default: return 0.0;
  }
}

export default db;
