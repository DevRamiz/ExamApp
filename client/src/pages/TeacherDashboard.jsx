import { mockApiService } from "../api/mockApiService";

function TeacherDashboard() {
  const exams = mockApiService.getExams();
  const submissions = mockApiService.getSubmissions();
  const publishedExams = exams.filter((exam) => exam.status === "published");
  const draftExams = exams.filter((exam) => exam.status === "draft");

  return (
    <section className="page-card">
      <h2>Teacher Dashboard</h2>
      <p className="muted">Overview of exams and student submissions.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{exams.length}</h3>
          <p>Total Exams</p>
        </div>
        <div className="stat-card">
          <h3>{publishedExams.length}</h3>
          <p>Published</p>
        </div>
        <div className="stat-card">
          <h3>{draftExams.length}</h3>
          <p>Drafts</p>
        </div>
        <div className="stat-card">
          <h3>{submissions.length}</h3>
          <p>Submissions</p>
        </div>
      </div>
    </section>
  );
}

export default TeacherDashboard;
