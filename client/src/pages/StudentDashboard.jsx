import { mockApiService } from "../api/mockApiService";

function StudentDashboard({ currentUser }) {
  const exams = mockApiService.getPublishedExams();
  const submissions = mockApiService
    .getSubmissions()
    .filter((submission) => submission.studentId === currentUser.id);

  return (
    <section className="page-card">
      <h2>Student Dashboard</h2>
      <p className="muted">Welcome, {currentUser.name}. Choose an exam and submit your answers.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{exams.length}</h3>
          <p>Available Exams</p>
        </div>
        <div className="stat-card">
          <h3>{submissions.length}</h3>
          <p>My Submissions</p>
        </div>
      </div>

      {submissions.length > 0 && (
        <div className="submission-list">
          <h3>My Results</h3>
          {submissions.map((submission) => (
            <p key={submission.id}>
              Exam #{submission.examId}: {submission.score}/{submission.total} - {submission.submittedAt}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}

export default StudentDashboard;
