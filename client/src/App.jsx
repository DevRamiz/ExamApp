import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import TeacherDashboard from "./pages/teacher/TeacherDashboard.jsx";
import TeacherExamsPage from "./pages/teacher/TeacherExamsPage.jsx";
import ExamEditorPage from "./pages/teacher/ExamEditorPage.jsx";
import ExamSubmissionsPage from "./pages/teacher/ExamSubmissionsPage.jsx";
import SubmissionReviewPage from "./pages/teacher/SubmissionReviewPage.jsx";
import TeacherAnalyticsPage from "./pages/teacher/TeacherAnalyticsPage.jsx";
import TeacherMonitoringPage from "./pages/teacher/TeacherMonitoringPage.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import TakeExamPage from "./pages/student/TakeExamPage.jsx";
import StudentResultsPage from "./pages/student/StudentResultsPage.jsx";
import StudentAnalyticsPage from "./pages/student/StudentAnalyticsPage.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";
import AdminExamsPage from "./pages/admin/AdminExamsPage.jsx";
import AdminAuditPage from "./pages/admin/AdminAuditPage.jsx";

function roleHome(role) {
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/teacher";
  return "/student";
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHome(user.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/exams" element={<ProtectedRoute role="teacher"><TeacherExamsPage /></ProtectedRoute>} />
        <Route path="/teacher/exams/new" element={<ProtectedRoute role="teacher"><ExamEditorPage /></ProtectedRoute>} />
        <Route path="/teacher/exams/:id/edit" element={<ProtectedRoute role="teacher"><ExamEditorPage /></ProtectedRoute>} />
        <Route path="/teacher/exams/:id/submissions" element={<ProtectedRoute role="teacher"><ExamSubmissionsPage /></ProtectedRoute>} />
        <Route path="/teacher/exams/:id/monitor" element={<ProtectedRoute role="teacher"><TeacherMonitoringPage /></ProtectedRoute>} />
        <Route path="/teacher/submissions/:id" element={<ProtectedRoute role="teacher"><SubmissionReviewPage /></ProtectedRoute>} />
        <Route path="/teacher/analytics" element={<ProtectedRoute role="teacher"><TeacherAnalyticsPage /></ProtectedRoute>} />

        <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/exams/:examId" element={<ProtectedRoute role="student"><TakeExamPage /></ProtectedRoute>} />
        <Route path="/student/results" element={<ProtectedRoute role="student"><StudentResultsPage /></ProtectedRoute>} />
        <Route path="/student/analytics" element={<ProtectedRoute role="student"><StudentAnalyticsPage /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/exams" element={<ProtectedRoute role="admin"><AdminExamsPage /></ProtectedRoute>} />
        <Route path="/admin/audits" element={<ProtectedRoute role="admin"><AdminAuditPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
