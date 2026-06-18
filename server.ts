import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDb, getGrade, getGradePoints } from './database.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Initialize DB (Now an async call)
  await initDb();

  // API Routes
  app.get('/api/departments', async (req, res) => {
    try {
      const result = await db.execute('SELECT * FROM Departments');
      res.json(result.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/students', async (req, res) => {
    try {
      const result = await db.execute(`
        SELECT s.*, d.dept_name
        FROM Students s
        JOIN Departments d ON s.dept_id = d.dept_id
      `);
      res.json(result.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/students', async (req, res) => {
    const { first_name, last_name, email, phone, dob, gender, dept_id, semester } = req.body;

    try {
      if (!first_name || !last_name || !email || !gender || !dept_id || !semester) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await db.execute({
        sql: `INSERT INTO Students (first_name, last_name, email, phone, dob, gender, dept_id, semester)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [first_name, last_name, email, phone || null, dob || null, gender, dept_id, semester]
      });

      const newStudent = await db.execute({
        sql: `SELECT s.*, d.dept_name FROM Students s JOIN Departments d ON s.dept_id = d.dept_id WHERE s.student_id = ?`,
        args: [Number(result.lastInsertRowid)]
      });

      res.json(newStudent.rows[0]);
    } catch (error: any) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.delete('/api/students/:student_id', async (req, res) => {
    const student_id = req.params.student_id;
    try {
      const student = await db.execute({ sql: 'SELECT 1 FROM Students WHERE student_id = ?', args: [student_id] });
      if (student.rows.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      await db.execute({ sql: 'DELETE FROM Students WHERE student_id = ?', args: [student_id] });
      res.json({ message: 'Student deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/students/:student_id', async (req, res) => {
    const student_id = req.params.student_id;
    const { first_name, last_name, email, phone, dob, gender, dept_id, semester } = req.body;

    try {
      if (!first_name || !last_name || !email || !gender || !dept_id || !semester) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const student = await db.execute({ sql: 'SELECT 1 FROM Students WHERE student_id = ?', args: [student_id] });
      if (student.rows.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      await db.execute({
        sql: `UPDATE Students SET first_name = ?, last_name = ?, email = ?, phone = ?, dob = ?, gender = ?, dept_id = ?, semester = ? WHERE student_id = ?`,
        args: [first_name, last_name, email, phone || null, dob || null, gender, dept_id, semester, student_id]
      });

      const updatedStudent = await db.execute({
        sql: `SELECT s.*, d.dept_name FROM Students s JOIN Departments d ON s.dept_id = d.dept_id WHERE s.student_id = ?`,
        args: [student_id]
      });

      res.json(updatedStudent.rows[0]);
    } catch (error: any) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.get('/api/courses', async (req, res) => {
    try {
      const result = await db.execute(`
        SELECT c.*, d.dept_name
        FROM Courses c
        JOIN Departments d ON c.dept_id = d.dept_id
      `);
      res.json(result.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/courses', async (req, res) => {
    const { course_code, course_name, credits, dept_id, is_elective } = req.body;

    try {
      if (!course_code || !course_name || !credits || !dept_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await db.execute({
        sql: `INSERT INTO Courses (course_code, course_name, credits, dept_id, is_elective) VALUES (?, ?, ?, ?, ?)`,
        args: [course_code, course_name, credits, dept_id, is_elective ? 1 : 0]
      });

      const newCourse = await db.execute({
        sql: `SELECT c.*, d.dept_name FROM Courses c JOIN Departments d ON c.dept_id = d.dept_id WHERE c.course_id = ?`,
        args: [Number(result.lastInsertRowid)]
      });

      res.json(newCourse.rows[0]);
    } catch (error: any) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Course code already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.put('/api/courses/:course_id', async (req, res) => {
    const course_id = req.params.course_id;
    const { course_code, course_name, credits, dept_id, is_elective } = req.body;

    try {
      if (!course_code || !course_name || !credits || !dept_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const course = await db.execute({ sql: 'SELECT 1 FROM Courses WHERE course_id = ?', args: [course_id] });
      if (course.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }

      await db.execute({
        sql: `UPDATE Courses SET course_code = ?, course_name = ?, credits = ?, dept_id = ?, is_elective = ? WHERE course_id = ?`,
        args: [course_code, course_name, credits, dept_id, is_elective ? 1 : 0, course_id]
      });

      const updatedCourse = await db.execute({
        sql: `SELECT c.*, d.dept_name FROM Courses c JOIN Departments d ON c.dept_id = d.dept_id WHERE c.course_id = ?`,
        args: [course_id]
      });

      res.json(updatedCourse.rows[0]);
    } catch (error: any) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Course code already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.get('/api/enrollments', async (req, res) => {
    try {
      const result = await db.execute(`
        SELECT e.*,
               s.first_name || ' ' || s.last_name as student_name,
               c.course_code, c.course_name
        FROM Enrollments e
        JOIN Students s ON e.student_id = s.student_id
        JOIN Courses c ON e.course_id = c.course_id
      `);

      const withGrades = result.rows.map((e: any) => ({
        ...e,
        grade: getGrade(e.marks)
      }));

      res.json(withGrades);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/audit-log', async (req, res) => {
    try {
      const result = await db.execute('SELECT * FROM Audit_Log ORDER BY change_time DESC LIMIT 50');
      res.json(result.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Procedures
  app.post('/api/enroll', async (req, res) => {
    const { student_id, course_id, semester, academic_year } = req.body;

    try {
      const student = await db.execute({ sql: 'SELECT 1 FROM Students WHERE student_id = ?', args: [student_id] });
      if (student.rows.length === 0) {
        return res.status(400).json({ error: `Student ID ${student_id} does not exist.` });
      }

      const course = await db.execute({ sql: 'SELECT 1 FROM Courses WHERE course_id = ?', args: [course_id] });
      if (course.rows.length === 0) {
        return res.status(400).json({ error: `Course ID ${course_id} does not exist.` });
      }

      const result = await db.execute({
        sql: 'INSERT INTO Enrollments (student_id, course_id, semester, academic_year) VALUES (?, ?, ?, ?)',
        args: [student_id, course_id, semester, academic_year]
      });

      const newEnrollment = await db.execute({
        sql: `SELECT e.*, s.first_name || ' ' || s.last_name as student_name, c.course_code, c.course_name
              FROM Enrollments e
              JOIN Students s ON e.student_id = s.student_id
              JOIN Courses c ON e.course_id = c.course_id
              WHERE e.enrollment_id = ?`,
        args: [Number(result.lastInsertRowid)]
      });

      const enrollmentData: any = newEnrollment.rows[0];
      res.json({
        ...enrollmentData,
        grade: getGrade(enrollmentData.marks)
      });
    } catch (error: any) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: `ERROR: Student ${student_id} is already enrolled in course ${course_id} for semester ${semester} (${academic_year}). Duplicate enrolment not allowed.` });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.post('/api/update-marks', async (req, res) => {
    const { enrollment_id, marks } = req.body;

    try {
      const enrollment = await db.execute({ sql: 'SELECT 1 FROM Enrollments WHERE enrollment_id = ?', args: [enrollment_id] });
      if (enrollment.rows.length === 0) {
        return res.status(400).json({ error: `ERROR: Enrollment ID ${enrollment_id} not found.` });
      }

      if (marks < 0 || marks > 100) {
        return res.status(400).json({ error: 'ERROR: Marks must be between 0 and 100.' });
      }

      await db.execute({
        sql: 'UPDATE Enrollments SET marks = ? WHERE enrollment_id = ?',
        args: [marks, enrollment_id]
      });

      const grade = getGrade(marks);
      res.json({ message: `SUCCESS: Marks updated. Grade: ${grade}`, grade });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/grade-sheet/:student_id', async (req, res) => {
    const student_id = req.params.student_id;

    try {
      const studentResult = await db.execute({ sql: 'SELECT * FROM Students WHERE student_id = ?', args: [student_id] });
      const student: any = studentResult.rows[0];

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const enrollmentsResult = await db.execute({
        sql: `SELECT e.enrollment_id, c.course_code, c.course_name, c.credits, e.semester, e.marks
              FROM Enrollments e
              JOIN Courses c ON e.course_id = c.course_id
              WHERE e.student_id = ?
              ORDER BY e.semester, c.course_code`,
        args: [student_id]
      });

      let total_credits = 0;
      let total_points = 0;

      const courses = enrollmentsResult.rows.map((e: any) => {
        const grade = getGrade(e.marks);
        const gradePoints = getGradePoints(grade);

        total_credits += Number(e.credits);
        total_points += (gradePoints * Number(e.credits));

        return {
          semester: e.semester,
          course_code: e.course_code,
          course_name: e.course_name,
          credits: e.credits,
          marks: e.marks !== null ? e.marks : '--',
          grade,
          grade_points: gradePoints
        };
      });

      const sgpa = total_credits > 0 ? (total_points / total_credits).toFixed(2) : '0.00';

      res.json({
        student: {
          id: student.student_id,
          name: `${student.first_name} ${student.last_name}`
        },
        courses,
        summary: {
          total_credits,
          sgpa
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();