import { useState } from "react";
import { mockApiService } from "./api/mockApiService";
import NavigationMenu from "./components/NavigationMenu";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherExamBuilder from "./pages/TeacherExamBuilder";
import TeacherExamList from "./pages/TeacherExamList";
import StudentDashboard from "./pages/StudentDashboard";
import StudentExamPage from "./pages/StudentExamPage";

function App() {
  const [currentUser, setCurrentUser] = useState(mockApiService.getCurrentUser());
  const [authPage, setAuthPage] = useState("login");
  const [currentPage, setCurrentPage] = useState(
    currentUser?.role === "teacher" ? "teacher-dashboard" : "student-dashboard"
  );

  function handleLogin(user) {
    setCurrentUser(user);
    setCurrentPage(user.role === "teacher" ? "teacher-dashboard" : "student-dashboard");
  }

  function handleLogout() {
    mockApiService.logout();
    setCurrentUser(null);
    setAuthPage("login");
  }

  function renderPage() {
    if (!currentUser) return null;

    if (currentPage === "teacher-dashboard") return <TeacherDashboard />;
    if (currentPage === "teacher-exams") return <TeacherExamList />;
    if (currentPage === "teacher-builder") return <TeacherExamBuilder currentUser={currentUser} />;
    if (currentPage === "student-dashboard") return <StudentDashboard currentUser={currentUser} />;
    if (currentPage === "student-exam") return <StudentExamPage currentUser={currentUser} />;

    return <TeacherDashboard />;
  }

  if (!currentUser) {
    return authPage === "login" ? (
      <LoginPage onLogin={handleLogin} goToRegister={() => setAuthPage("register")} />
    ) : (
      <RegisterPage onRegister={handleLogin} goToLogin={() => setAuthPage("login")} />
    );
  }

  return (
    <div className="app-shell">
      <NavigationMenu
        currentUser={currentUser}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
      />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default App;
