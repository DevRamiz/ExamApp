function NavigationMenu({ currentUser, currentPage, setCurrentPage, onLogout }) {
  if (!currentUser) return null;

  const teacherPages = [
    { key: "teacher-dashboard", label: "Teacher Dashboard" },
    { key: "teacher-exams", label: "Manage Exams" },
    { key: "teacher-builder", label: "Build Exam" },
  ];

  const studentPages = [
    { key: "student-dashboard", label: "Student Dashboard" },
    { key: "student-exam", label: "Take Exam" },
  ];

  const pages = currentUser.role === "teacher" ? teacherPages : studentPages;

  return (
    <nav className="nav-menu">
      <div>
        <strong>E-Test System</strong>
        <span className="user-pill">{currentUser.name} - {currentUser.role}</span>
      </div>
      <div className="nav-links">
        {pages.map((page) => (
          <button
            key={page.key}
            className={currentPage === page.key ? "active" : ""}
            onClick={() => setCurrentPage(page.key)}
          >
            {page.label}
          </button>
        ))}
        <button className="danger" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default NavigationMenu;
