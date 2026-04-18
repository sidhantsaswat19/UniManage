# 🎓 UniManage: University Database Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-success)](https://unimanage-production.up.railway.app/)
[![Database](https://img.shields.io/badge/Database-MySQL-blue)](https://www.mysql.com/)
[![Deployment](https://img.shields.io/badge/Deployed_on-Railway-black)](https://railway.app/)

**UniManage** is a robust relational database management system designed to handle core university operations. It enforces strict data integrity, automates academic calculations, and maintains a secure audit trail of administrative actions.

🌐 **Live Web Interface:** [unimanage-production.up.railway.app](https://unimanage-production.up.railway.app/)

---

## 📖 Problem Statement
The objective of this project was to design a comprehensive `UniversityDB` with tables for Students, Departments, Courses, and Enrollments. The database must:
1. Enforce `PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `UNIQUE`, and `CHECK` constraints to ensure zero data anomalies.
2. Utilize **Stored Procedures** to enroll students, featuring active exception handling to prevent duplicate enrollments.
3. Feature a **Cursor-Based Procedure** to generate dynamic semester grade sheets utilizing a custom `get_grade()` scalar function.
4. Implement `AFTER INSERT` and `AFTER UPDATE` **Triggers** for automated security audit logging.
5. Provide **Views** for real-time department-wise student strength and grading reports.

---

## 🗄️ Database Architecture Schema

### Core Tables
* **`Departments`**: Manages department details, HOD information, and campus locations.
* **`Students`**: Stores student demographics, linked to their respective departments. Enforces `CHECK` constraints on gender and semester bounds.
* **`Courses`**: Catalog of all university courses, tracking credits and whether a course is an elective.
* **`Enrollments`**: The junction table linking students to courses. Utilizes a composite `UNIQUE` constraint to prevent duplicate enrollments in a single semester.
* **`Audit_Log`**: An immutable ledger that automatically records database insertions and updates.

---

## ⚙️ Advanced SQL Features Implemented

### 1. Data Integrity & Constraints
* **Referential Integrity:** `ON DELETE CASCADE` applied to student enrollments; `ON DELETE RESTRICT` applied to departments to prevent accidental deletion of active entities.
* **Domain Constraints:** Strict `CHECK` constraints on marks (0-100) and credits (1-6).

### 2. Stored Procedures & Functions
* `get_grade(marks)`: A deterministic scalar function that maps numerical scores to official letter grades (O, A+, A, etc.).
* `enroll_student()`: Validates student/course existence and safely registers the student. Includes `SQLEXCEPTION` handlers to catch and report duplicate constraint violations gracefully.
* `generate_grade_sheet()`: A cursor-based procedure that iterates through a student's enrolled courses, calculates grade points, tallies total credits, and computes the final SGPA.

### 3. Automated Triggers
* `trg_enrollment_insert`: Logs a record whenever a student is enrolled.
* `trg_enrollment_update`: Tracks score modifications, logging the *old* mark, *new* mark, and the resulting grade.
* `trg_student_insert`: Audits the admission of new students.

### 4. Analytical Views
* `vw_dept_student_strength`: Aggregates the total number of students per department, grouped by gender.
* `vw_enrollment_grade_report`: A pre-joined, human-readable report card mapping student IDs directly to course names and calculated letter grades.

---

## 🚀 Installation & Setup (Local Development)

If you wish to run the database locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/unimanage.git](https://github.com/yourusername/unimanage.git)
   cd unimanage
