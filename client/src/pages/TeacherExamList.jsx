import { useState } from "react";
import { mockApiService } from "../api/mockApiService";

function TeacherExamList() {
  const [exams, setExams] = useState(mockApiService.getExams());
  const [searchText, setSearchText] = useState("");

  function changeStatus(examId, status) {
    mockApiService.changeExamStatus(examId, status);
    setExams(mockApiService.getExams());
  }

  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(searchText.toLowerCase()) ||
    exam.course.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <section className="page-card">
      <h2>Manage Exams</h2>
      <p className="muted">View exams, search them, and change their status.</p>

      <label>Search exams</label>
      <input
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        placeholder="Search by title or course"
      />

      <div className="exam-grid">
        {filteredExams.map((exam) => (
          <article className="exam-card" key={exam.id}>
            <h3>{exam.title}</h3>
            <p><strong>Course:</strong> {exam.course}</p>
            <p><strong>Status:</strong> <span className={`status ${exam.status}`}>{exam.status}</span></p>
            <p><strong>Questions:</strong> {exam.questions.length}</p>
            <div className="button-row">
              <button onClick={() => changeStatus(exam.id, "published")}>Publish</button>
              <button className="secondary" onClick={() => changeStatus(exam.id, "draft")}>Draft</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TeacherExamList;
