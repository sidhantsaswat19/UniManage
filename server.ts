import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDb, getGrade, getGradePoints } from './database.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize DB
  initDb();

  // API Routes
  app.get('/api/departments', (req, res) => {
    const depts = db.prepare('SELECT * FROM Departments').all();
    res.json(depts);
  });

  app.get('/api/students', (req, res) => {
    const students = db.prepare(`
      SELECT s.*, d.dept_name 
      FROM Students s 
      JOIN Departments d ON s.dept_id = d.dept_id
    `).all();
    res.json(students);
  });

  app.post('/api/students', (req, res) => {
    const { first_name, last_name, email, phone, dob, gender, dept_id, semester } = req.body;
    
    try {
      if (!first_name || !last_name || !email || !gender || !dept_id || !semester) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = db.prepare(`
        INSERT INTO Students (first_name, last_name, email, phone, dob, gender, dept_id, semester) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(first_name, last_name, email, phone || null, dob || null, gender, dept_id, semester);
      
      const newStudent = db.prepare(`
        SELECT s.*, d.dept_name 
        FROM Students s 
        JOIN Departments d ON s.dept_id = d.dept_id
        WHERE s.student_id = ?
      `).get(result.lastInsertRowid);

      res.json(newStudent);
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.delete('/api/students/:student_id', (req, res) => {
    const student_id = req.params.student_id;
    try {
      const student = db.prepare('SELECT 1 FROM Students WHERE student_id = ?').get(student_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      db.prepare('DELETE FROM Students WHERE student_id = ?').run(student_id);
      res.json({ message: 'Student deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/students/:student_id', (req, res) => {
    const student_id = req.params.student_id;
    const { first_name, last_name, email, phone, dob, gender, dept_id, semester } = req.body;
    
    try {
      if (!first_name || !last_name || !email || !gender || !dept_id || !semester) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const student = db.prepare('SELECT 1 FROM Students WHERE student_id = ?').get(student_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      db.prepare(`
        UPDATE Students 
        SET first_name = ?, last_name = ?, email = ?, phone = ?, dob = ?, gender = ?, dept_id = ?, semester = ?
        WHERE student_id = ?
      `).run(first_name, last_name, email, phone || null, dob || null, gender, dept_id, semester, student_id);
      
      const updatedStudent = db.prepare(`
        SELECT s.*, d.dept_name 
        FROM Students s 
        JOIN Departments d ON s.dept_id = d.dept_id
        WHERE s.student_id = ?
      `).get(student_id);

      res.json(updatedStudent);
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.get('/api/courses', (req, res) => {
    const courses = db.prepare(`
      SELECT c.*, d.dept_name 
      FROM Courses c 
      JOIN Departments d ON c.dept_id = d.dept_id
    `).all();
    res.json(courses);
  });

  app.post('/api/courses', (req, res) => {
    const { course_code, course_name, credits, dept_id, is_elective } = req.body;
    
    try {
      if (!course_code || !course_name || !credits || !dept_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = db.prepare(`
        INSERT INTO Courses (course_code, course_name, credits, dept_id, is_elective) 
        VALUES (?, ?, ?, ?, ?)
      `).run(course_code, course_name, credits, dept_id, is_elective ? 1 : 0);
      
      const newCourse = db.prepare(`
        SELECT c.*, d.dept_name 
        FROM Courses c 
        JOIN Departments d ON c.dept_id = d.dept_id
        WHERE c.course_id = ?
      `).get(result.lastInsertRowid);

      res.json(newCourse);
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Course code already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.put('/api/courses/:course_id', (req, res) => {
    const course_id = req.params.course_id;
    const { course_code, course_name, credits, dept_id, is_elective } = req.body;
    
    try {
      if (!course_code || !course_name || !credits || !dept_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const course = db.prepare('SELECT 1 FROM Courses WHERE course_id = ?').get(course_id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      db.prepare(`
        UPDATE Courses 
        SET course_code = ?, course_name = ?, credits = ?, dept_id = ?, is_elective = ?
        WHERE course_id = ?
      `).run(course_code, course_name, credits, dept_id, is_elective ? 1 : 0, course_id);
      
      const updatedCourse = db.prepare(`
        SELECT c.*, d.dept_name 
        FROM Courses c 
        JOIN Departments d ON c.dept_id = d.dept_id
        WHERE c.course_id = ?
      `).get(course_id);

      res.json(updatedCourse);
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Course code already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.get('/api/enrollments', (req, res) => {
    const enrollments = db.prepare(`
      SELECT e.*, 
             s.first_name || ' ' || s.last_name as student_name,
             c.course_code, c.course_name
      FROM Enrollments e
      JOIN Students s ON e.student_id = s.student_id
      JOIN Courses c ON e.course_id = c.course_id
    `).all();
    
    const withGrades = enrollments.map((e: any) => ({
      ...e,
      grade: getGrade(e.marks)
    }));
    
    res.json(withGrades);
  });

  app.get('/api/audit-log', (req, res) => {
    const logs = db.prepare('SELECT * FROM Audit_Log ORDER BY change_time DESC LIMIT 50').all();
    res.json(logs);
  });

  // Procedures
  app.post('/api/enroll', (req, res) => {
    const { student_id, course_id, semester, academic_year } = req.body;
    
    try {
      const student = db.prepare('SELECT 1 FROM Students WHERE student_id = ?').get(student_id);
      if (!student) {
        return res.status(400).json({ error: `Student ID \${student_id} does not exist.` });
      }

      const course = db.prepare('SELECT 1 FROM Courses WHERE course_id = ?').get(course_id);
      if (!course) {
        return res.status(400).json({ error: `Course ID \${course_id} does not exist.` });
      }

      const result = db.prepare('INSERT INTO Enrollments (student_id, course_id, semester, academic_year) VALUES (?, ?, ?, ?)').run(student_id, course_id, semester, academic_year);
      
      const newEnrollment: any = db.prepare(`
        SELECT e.*, 
               s.first_name || ' ' || s.last_name as student_name,
               c.course_code, c.course_name
        FROM Enrollments e
        JOIN Students s ON e.student_id = s.student_id
        JOIN Courses c ON e.course_id = c.course_id
        WHERE e.enrollment_id = ?
      `).get(result.lastInsertRowid);
      
      res.json({
        ...newEnrollment,
        grade: getGrade(newEnrollment.marks)
      });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: `ERROR: Student \${student_id} is already enrolled in course \${course_id} for semester \${semester} (\${academic_year}). Duplicate enrolment not allowed.` });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.post('/api/update-marks', (req, res) => {
    const { enrollment_id, marks } = req.body;
    
    try {
      const enrollment = db.prepare('SELECT 1 FROM Enrollments WHERE enrollment_id = ?').get(enrollment_id);
      if (!enrollment) {
        return res.status(400).json({ error: `ERROR: Enrollment ID \${enrollment_id} not found.` });
      }

      if (marks < 0 || marks > 100) {
        return res.status(400).json({ error: 'ERROR: Marks must be between 0 and 100.' });
      }

      db.prepare('UPDATE Enrollments SET marks = ? WHERE enrollment_id = ?').run(marks, enrollment_id);
      
      const grade = getGrade(marks);
      res.json({ message: `SUCCESS: Marks updated. Grade: \${grade}`, grade });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/grade-sheet/:student_id', (req, res) => {
    const student_id = req.params.student_id;
    
    try {
      const student: any = db.prepare('SELECT * FROM Students WHERE student_id = ?').get(student_id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const enrollments = db.prepare(`
        SELECT e.enrollment_id, c.course_code, c.course_name, c.credits, e.semester, e.marks
        FROM Enrollments e
        JOIN Courses c ON e.course_id = c.course_id
        WHERE e.student_id = ?
        ORDER BY e.semester, c.course_code
      `).all(student_id);

      let total_credits = 0;
      let total_points = 0;

      const courses = enrollments.map((e: any) => {
        const grade = getGrade(e.marks);
        const gradePoints = getGradePoints(grade);
        
        total_credits += e.credits;
        total_points += (gradePoints * e.credits);

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
          name: `\${student.first_name} \${student.last_name}`
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
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:\${PORT}`);
  });
}

startServer();
