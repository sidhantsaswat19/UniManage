import { useEffect, useState } from 'react';
import { BookOpen, Users, Building2, Activity, GraduationCap, ClipboardList, Plus, X, Search, Filter, FileText, Trash2, Pencil } from 'lucide-react';
import { cn } from './lib/utils';

type Tab = 'dashboard' | 'departments' | 'students' | 'courses' | 'enrollments' | 'audit';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [data, setData] = useState<any>({
    departments: [],
    students: [],
    courses: [],
    enrollments: [],
    audit: []
  });
  const [loading, setLoading] = useState(true);
  
  // Student form state
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'M',
    dept_id: '',
    semester: 1
  });
  const [formError, setFormError] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [gradeSheet, setGradeSheet] = useState<any>(null);
  const [loadingGradeSheet, setLoadingGradeSheet] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editStudentForm, setEditStudentForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'M',
    dept_id: '',
    semester: 1
  });
  const [editStudentFormError, setEditStudentFormError] = useState('');

  // Course form state
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    course_code: '',
    course_name: '',
    credits: 3,
    dept_id: '',
    is_elective: false
  });
  const [courseFormError, setCourseFormError] = useState('');

  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editCourseForm, setEditCourseForm] = useState({
    course_code: '',
    course_name: '',
    credits: 3,
    dept_id: '',
    is_elective: false
  });
  const [editCourseFormError, setEditCourseFormError] = useState('');

  // Enrollment form state
  const [showAddEnrollment, setShowAddEnrollment] = useState(false);
  const [enrollmentForm, setEnrollmentForm] = useState({
    student_id: '',
    course_id: '',
    semester: 1,
    academic_year: '2024-25'
  });
  const [enrollmentFormError, setEnrollmentFormError] = useState('');

  // Audit filter state
  const [auditFilterTable, setAuditFilterTable] = useState('');
  const [auditFilterAction, setAuditFilterAction] = useState('');
  const [auditFilterStartDate, setAuditFilterStartDate] = useState('');
  const [auditFilterEndDate, setAuditFilterEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depts, students, courses, enrollments, audit] = await Promise.all([
          fetch('/api/departments').then(res => res.json()),
          fetch('/api/students').then(res => res.json()),
          fetch('/api/courses').then(res => res.json()),
          fetch('/api/enrollments').then(res => res.json()),
          fetch('/api/audit-log').then(res => res.json())
        ]);

        setData({
          departments: depts,
          students,
          courses,
          enrollments,
          audit
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      });
      
      if (res.ok) {
        const newStudent = await res.json();
        setData((prev: any) => ({ ...prev, students: [...prev.students, newStudent] }));
        setShowAddStudent(false);
        setStudentForm({ first_name: '', last_name: '', email: '', phone: '', dob: '', gender: 'M', dept_id: '', semester: 1 });
      } else {
        const err = await res.json();
        setFormError(err.error || 'Failed to add student');
      }
    } catch (error) {
      console.error(error);
      setFormError('An unexpected error occurred');
    }
  };

  const handleEditStudentClick = (student: any) => {
    setEditingStudent(student);
    setEditStudentForm({
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      phone: student.phone || '',
      dob: student.dob || '',
      gender: student.gender,
      dept_id: student.dept_id,
      semester: student.semester
    });
    setEditStudentFormError('');
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditStudentFormError('');
    
    try {
      const res = await fetch(`/api/students/${editingStudent.student_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editStudentForm)
      });
      
      if (res.ok) {
        const updatedStudent = await res.json();
        setData((prev: any) => ({
          ...prev,
          students: prev.students.map((s: any) => s.student_id === updatedStudent.student_id ? updatedStudent : s)
        }));
        setEditingStudent(null);
      } else {
        const err = await res.json();
        setEditStudentFormError(err.error || 'Failed to update student');
      }
    } catch (error) {
      console.error(error);
      setEditStudentFormError('An unexpected error occurred');
    }
  };

  const handleEditCourseClick = (course: any) => {
    setEditingCourse(course);
    setEditCourseForm({
      course_code: course.course_code,
      course_name: course.course_name,
      credits: course.credits,
      dept_id: course.dept_id,
      is_elective: course.is_elective === 1 || course.is_elective === true
    });
    setEditCourseFormError('');
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditCourseFormError('');
    
    try {
      const res = await fetch(`/api/courses/${editingCourse.course_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCourseForm)
      });
      
      if (res.ok) {
        const updatedCourse = await res.json();
        setData((prev: any) => ({
          ...prev,
          courses: prev.courses.map((c: any) => c.course_id === updatedCourse.course_id ? updatedCourse : c)
        }));
        setEditingCourse(null);
      } else {
        const err = await res.json();
        setEditCourseFormError(err.error || 'Failed to update course');
      }
    } catch (error) {
      console.error(error);
      setEditCourseFormError('An unexpected error occurred');
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseFormError('');
    
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });
      
      if (res.ok) {
        const newCourse = await res.json();
        setData((prev: any) => ({ ...prev, courses: [...prev.courses, newCourse] }));
        setShowAddCourse(false);
        setCourseForm({ course_code: '', course_name: '', credits: 3, dept_id: '', is_elective: false });
      } else {
        const err = await res.json();
        setCourseFormError(err.error || 'Failed to add course');
      }
    } catch (error) {
      console.error(error);
      setCourseFormError('An unexpected error occurred');
    }
  };

  const handleAddEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollmentFormError('');
    
    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrollmentForm)
      });
      
      if (res.ok) {
        const newEnrollment = await res.json();
        setData((prev: any) => ({ ...prev, enrollments: [...prev.enrollments, newEnrollment] }));
        setShowAddEnrollment(false);
        setEnrollmentForm({ student_id: '', course_id: '', semester: 1, academic_year: '2024-25' });
      } else {
        const err = await res.json();
        setEnrollmentFormError(err.error || 'Failed to enroll student');
      }
    } catch (error) {
      console.error(error);
      setEnrollmentFormError('An unexpected error occurred');
    }
  };

  const fetchGradeSheet = async (studentId: number) => {
    setLoadingGradeSheet(true);
    try {
      const res = await fetch(`/api/grade-sheet/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setGradeSheet(data);
      } else {
        console.error('Failed to fetch grade sheet');
      }
    } catch (error) {
      console.error('Error fetching grade sheet:', error);
    } finally {
      setLoadingGradeSheet(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    try {
      const res = await fetch(`/api/students/${studentToDelete.student_id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          students: prev.students.filter((s: any) => s.student_id !== studentToDelete.student_id),
          enrollments: prev.enrollments.filter((e: any) => e.student_name !== `${studentToDelete.first_name} ${studentToDelete.last_name}`)
        }));
        setStudentToDelete(null);
      } else {
        console.error('Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Departments" value={data.departments.length} icon={<Building2 className="w-8 h-8 text-blue-500" />} />
            <StatCard title="Total Students" value={data.students.length} icon={<Users className="w-8 h-8 text-green-500" />} />
            <StatCard title="Total Courses" value={data.courses.length} icon={<BookOpen className="w-8 h-8 text-purple-500" />} />
            <StatCard title="Total Enrollments" value={data.enrollments.length} icon={<GraduationCap className="w-8 h-8 text-orange-500" />} />
          </div>
        );
      case 'departments':
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HOD</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.departments.map((dept: any) => (
                  <tr key={dept.dept_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.dept_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.dept_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.hod_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'students': {
        const filteredStudents = data.students.filter((student: any) => {
          const searchLower = studentSearch.toLowerCase();
          const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
          return fullName.includes(searchLower) || student.email.toLowerCase().includes(searchLower);
        });

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <button
                onClick={() => setShowAddStudent(true)}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>

            {showAddStudent && (
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Student</h3>
                  <button onClick={() => setShowAddStudent(false)} className="text-gray-400 hover:text-gray-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {formError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={studentForm.first_name}
                        onChange={e => setStudentForm({ ...studentForm, first_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={studentForm.last_name}
                        onChange={e => setStudentForm({ ...studentForm, last_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={studentForm.email}
                        onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={studentForm.phone}
                        onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={studentForm.dob}
                        onChange={e => setStudentForm({ ...studentForm, dob: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                      <select
                        required
                        value={studentForm.gender}
                        onChange={e => setStudentForm({ ...studentForm, gender: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                      <select
                        required
                        value={studentForm.dept_id}
                        onChange={e => setStudentForm({ ...studentForm, dept_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Select Department</option>
                        {data.departments.map((d: any) => (
                          <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        required
                        value={studentForm.semester}
                        onChange={e => setStudentForm({ ...studentForm, semester: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddStudent(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Save Student
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sem</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student: any) => (
                    <tr key={student.student_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.student_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.first_name} {student.last_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.dept_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.semester}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button 
                            onClick={() => handleEditStudentClick(student)}
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                          >
                            <Pencil className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={() => fetchGradeSheet(student.student_id)}
                            disabled={loadingGradeSheet}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1 disabled:opacity-50"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Grade Sheet</span>
                          </button>
                          <button 
                            onClick={() => setStudentToDelete(student)}
                            className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit Student Modal */}
            {editingStudent && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Student</h3>
                    <button onClick={() => setEditingStudent(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {editStudentFormError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                      {editStudentFormError}
                    </div>
                  )}

                  <form onSubmit={handleUpdateStudent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          required
                          value={editStudentForm.first_name}
                          onChange={e => setEditStudentForm({...editStudentForm, first_name: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                          type="text"
                          required
                          value={editStudentForm.last_name}
                          onChange={e => setEditStudentForm({...editStudentForm, last_name: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          required
                          value={editStudentForm.email}
                          onChange={e => setEditStudentForm({...editStudentForm, email: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={editStudentForm.phone}
                          onChange={e => setEditStudentForm({...editStudentForm, phone: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={editStudentForm.dob}
                          onChange={e => setEditStudentForm({...editStudentForm, dob: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                        <select
                          required
                          value={editStudentForm.gender}
                          onChange={e => setEditStudentForm({...editStudentForm, gender: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                        <select
                          required
                          value={editStudentForm.dept_id}
                          onChange={e => setEditStudentForm({...editStudentForm, dept_id: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Department</option>
                          {data.departments.map((d: any) => (
                            <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="8"
                          value={editStudentForm.semester}
                          onChange={e => setEditStudentForm({...editStudentForm, semester: parseInt(e.target.value)})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingStudent(null)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {studentToDelete && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Student</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete <strong>{studentToDelete.first_name} {studentToDelete.last_name}</strong>? This action cannot be undone and will also delete all of their enrollments.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setStudentToDelete(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteStudent}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Grade Sheet Modal */}
            {gradeSheet && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Grade Sheet</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {gradeSheet.student.name} &bull; ID: {gradeSheet.student.id}
                      </p>
                    </div>
                    <button 
                      onClick={() => setGradeSheet(null)} 
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto flex-1 bg-white">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sem</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {gradeSheet.courses.length > 0 ? (
                            gradeSheet.courses.map((c: any, i: number) => (
                              <tr key={i} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3 text-sm text-gray-500">{c.semester}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.course_code}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{c.course_name}</td>
                                <td className="px-4 py-3 text-sm text-center text-gray-500">{c.credits}</td>
                                <td className="px-4 py-3 text-sm text-center text-gray-500">{c.marks}</td>
                                <td className="px-4 py-3 text-sm text-center font-medium">
                                  <span className={cn(
                                    "px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-md",
                                    c.grade === 'O' || c.grade === 'A+' || c.grade === 'A' ? "bg-green-100 text-green-800" :
                                    c.grade === 'B+' || c.grade === 'B' ? "bg-blue-100 text-blue-800" :
                                    c.grade === 'C' ? "bg-yellow-100 text-yellow-800" :
                                    c.grade === 'F' ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                                  )}>
                                    {c.grade}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-center text-gray-500">{c.grade_points.toFixed(1)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                                No enrollments found for this student.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end items-center space-x-8">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Total Credits</p>
                      <p className="text-2xl font-bold text-gray-900">{gradeSheet.summary.total_credits}</p>
                    </div>
                    <div className="w-px h-12 bg-gray-200"></div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">SGPA</p>
                      <p className="text-3xl font-black text-indigo-600">{gradeSheet.summary.sgpa}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
      case 'courses':
        return (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddCourse(true)}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Course</span>
              </button>
            </div>

            {showAddCourse && (
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Course</h3>
                  <button onClick={() => setShowAddCourse(false)} className="text-gray-400 hover:text-gray-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {courseFormError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {courseFormError}
                  </div>
                )}

                <form onSubmit={handleAddCourse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CS401"
                        value={courseForm.course_code}
                        onChange={e => setCourseForm({ ...courseForm, course_code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
                      <input
                        type="text"
                        required
                        value={courseForm.course_name}
                        onChange={e => setCourseForm({ ...courseForm, course_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Credits *</label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        required
                        value={courseForm.credits}
                        onChange={e => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                      <select
                        required
                        value={courseForm.dept_id}
                        onChange={e => setCourseForm({ ...courseForm, dept_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Select Department</option>
                        {data.departments.map((d: any) => (
                          <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2 flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="is_elective"
                        checked={courseForm.is_elective}
                        onChange={e => setCourseForm({ ...courseForm, is_elective: e.target.checked })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_elective" className="ml-2 block text-sm text-gray-900">
                        This is an elective course
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddCourse(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Save Course
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.courses.map((course: any) => (
                    <tr key={course.course_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.course_code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.course_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.credits}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.dept_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", course.is_elective ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800")}>
                          {course.is_elective ? 'Elective' : 'Core'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEditCourseClick(course)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end space-x-1 ml-auto"
                        >
                          <Pencil className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit Course Modal */}
            {editingCourse && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Course</h3>
                    <button onClick={() => setEditingCourse(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {editCourseFormError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                      {editCourseFormError}
                    </div>
                  )}

                  <form onSubmit={handleUpdateCourse} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
                        <input
                          type="text"
                          required
                          value={editCourseForm.course_code}
                          onChange={e => setEditCourseForm({...editCourseForm, course_code: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
                        <input
                          type="text"
                          required
                          value={editCourseForm.course_name}
                          onChange={e => setEditCourseForm({...editCourseForm, course_name: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Credits *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="6"
                          value={editCourseForm.credits}
                          onChange={e => setEditCourseForm({...editCourseForm, credits: parseInt(e.target.value)})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                        <select
                          required
                          value={editCourseForm.dept_id}
                          onChange={e => setEditCourseForm({...editCourseForm, dept_id: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Department</option>
                          {data.departments.map((d: any) => (
                            <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center mt-4">
                      <input
                        type="checkbox"
                        id="edit_is_elective"
                        checked={editCourseForm.is_elective}
                        onChange={e => setEditCourseForm({...editCourseForm, is_elective: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="edit_is_elective" className="ml-2 block text-sm text-gray-900">
                        This is an elective course
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingCourse(null)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      case 'enrollments':
        return (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddEnrollment(true)}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Enrollment</span>
              </button>
            </div>

            {showAddEnrollment && (
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Enroll Student in Course</h3>
                  <button onClick={() => setShowAddEnrollment(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {enrollmentFormError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {enrollmentFormError}
                  </div>
                )}

                <form onSubmit={handleAddEnrollment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                      <select
                        required
                        value={enrollmentForm.student_id}
                        onChange={e => setEnrollmentForm({...enrollmentForm, student_id: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Student</option>
                        {data.students.map((s: any) => (
                          <option key={s.student_id} value={s.student_id}>
                            {s.first_name} {s.last_name} ({s.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                      <select
                        required
                        value={enrollmentForm.course_id}
                        onChange={e => setEnrollmentForm({...enrollmentForm, course_id: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Course</option>
                        {data.courses.map((c: any) => (
                          <option key={c.course_id} value={c.course_id}>
                            {c.course_code} - {c.course_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="8"
                        value={enrollmentForm.semester}
                        onChange={e => setEnrollmentForm({...enrollmentForm, semester: parseInt(e.target.value)})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                      <input
                        type="text"
                        required
                        pattern="\d{4}-\d{2}"
                        placeholder="YYYY-YY (e.g., 2024-25)"
                        value={enrollmentForm.academic_year}
                        onChange={e => setEnrollmentForm({...enrollmentForm, academic_year: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddEnrollment(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Enroll Student
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.enrollments.map((enr: any) => (
                  <tr key={enr.enrollment_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{enr.student_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enr.course_code} - {enr.course_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enr.semester}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enr.marks !== null ? enr.marks : '--'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={cn(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        enr.grade === 'O' || enr.grade === 'A+' || enr.grade === 'A' ? "bg-green-100 text-green-800" :
                        enr.grade === 'B+' || enr.grade === 'B' ? "bg-blue-100 text-blue-800" :
                        enr.grade === 'C' ? "bg-yellow-100 text-yellow-800" :
                        enr.grade === 'F' ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                      )}>
                        {enr.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        );
      case 'audit': {
        const filteredAudit = data.audit.filter((log: any) => {
          let matches = true;
          
          if (auditFilterTable && log.table_name !== auditFilterTable) matches = false;
          if (auditFilterAction && log.action_type !== auditFilterAction) matches = false;
          
          if (auditFilterStartDate || auditFilterEndDate) {
            const logDate = new Date(log.change_time);
            if (auditFilterStartDate) {
              const start = new Date(auditFilterStartDate);
              start.setHours(0, 0, 0, 0);
              if (logDate < start) matches = false;
            }
            if (auditFilterEndDate) {
              const end = new Date(auditFilterEndDate);
              end.setHours(23, 59, 59, 999);
              if (logDate > end) matches = false;
            }
          }
          
          return matches;
        });

        const uniqueTables = Array.from(new Set(data.audit.map((l: any) => l.table_name)));
        const uniqueActions = Array.from(new Set(data.audit.map((l: any) => l.action_type)));

        return (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex flex-wrap gap-4 items-end">
              <div className="flex items-center space-x-2 text-gray-500 mb-1 md:mb-0 md:mr-2">
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filters:</span>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Table</label>
                <select 
                  value={auditFilterTable} 
                  onChange={e => setAuditFilterTable(e.target.value)} 
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white min-w-[150px]"
                >
                  <option value="">All Tables</option>
                  {uniqueTables.map((t: any) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Action</label>
                <select 
                  value={auditFilterAction} 
                  onChange={e => setAuditFilterAction(e.target.value)} 
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white min-w-[150px]"
                >
                  <option value="">All Actions</option>
                  {uniqueActions.map((a: any) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Start Date</label>
                <input 
                  type="date" 
                  value={auditFilterStartDate} 
                  onChange={e => setAuditFilterStartDate(e.target.value)} 
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">End Date</label>
                <input 
                  type="date" 
                  value={auditFilterEndDate} 
                  onChange={e => setAuditFilterEndDate(e.target.value)} 
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white" 
                />
              </div>
              
              <button 
                onClick={() => { 
                  setAuditFilterTable(''); 
                  setAuditFilterAction(''); 
                  setAuditFilterStartDate(''); 
                  setAuditFilterEndDate(''); 
                }} 
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAudit.length > 0 ? (
                    filteredAudit.map((log: any) => (
                      <tr key={log.log_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.change_time).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.table_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", log.action_type === 'INSERT' ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800")}>
                            {log.action_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{log.description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                        No audit logs match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <GraduationCap className="w-8 h-8 text-indigo-300" />
          <span className="text-xl font-bold tracking-tight">UniManage</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-6">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Activity />} label="Dashboard" />
          <NavItem active={activeTab === 'departments'} onClick={() => setActiveTab('departments')} icon={<Building2 />} label="Departments" />
          <NavItem active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<Users />} label="Students" />
          <NavItem active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} icon={<BookOpen />} label="Courses" />
          <NavItem active={activeTab === 'enrollments'} onClick={() => setActiveTab('enrollments')} icon={<GraduationCap />} label="Enrollments" />
          <NavItem active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={<ClipboardList />} label="Audit Log" />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h1>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200",
        active ? "bg-indigo-800 text-white" : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
      )}
    >
      <div className="w-5 h-5">{icon}</div>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4 border border-gray-100">
      <div className="p-3 bg-gray-50 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
