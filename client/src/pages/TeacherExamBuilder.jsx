import { useState } from "react";
import { mockApiService } from "../api/mockApiService";
import { notifyService } from "../services/notifyService";

function TeacherExamBuilder({ currentUser }) {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [createdExam, setCreatedExam] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [optionsText, setOptionsText] = useState("Option A, Option B, Option C, Option D");
  const [correctAnswer, setCorrectAnswer] = useState("");

  function createExam(event) {
    event.preventDefault();
    const exam = mockApiService.createExam(title, course, currentUser.id);
    setCreatedExam(exam);
    setTitle("");
    setCourse("");
    notifyService.success("Exam created as draft");
  }

  function addQuestion(event) {
    event.preventDefault();

    if (!createdExam) {
      notifyService.error("Create an exam first");
      return;
    }

    const options = optionsText.split(",").map((item) => item.trim()).filter(Boolean);
    const updatedExam = mockApiService.addQuestion(createdExam.id, questionText, options, correctAnswer);
    setCreatedExam(updatedExam);
    setQuestionText("");
    setCorrectAnswer("");
    notifyService.success("Question added");
  }

  return (
    <section className="page-card">
      <h2>Build Exam</h2>
      <p className="muted">Create a draft exam and add questions to it.</p>

      <form className="form-grid" onSubmit={createExam}>
        <div>
          <label>Exam Title</label>
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </div>
        <div>
          <label>Course</label>
          <input value={course} onChange={(event) => setCourse(event.target.value)} required />
        </div>
        <button type="submit">Create Exam</button>
      </form>

      {createdExam && (
        <div className="builder-area">
          <h3>Current Exam: {createdExam.title}</h3>
          <p>Status: {createdExam.status}</p>
          <p>Questions: {createdExam.questions.length}</p>

          <form onSubmit={addQuestion}>
            <label>Question Text</label>
            <input value={questionText} onChange={(event) => setQuestionText(event.target.value)} required />

            <label>Options separated by commas</label>
            <input value={optionsText} onChange={(event) => setOptionsText(event.target.value)} required />

            <label>Correct Answer</label>
            <input value={correctAnswer} onChange={(event) => setCorrectAnswer(event.target.value)} required />

            <button type="submit">Add Question</button>
          </form>
        </div>
      )}
    </section>
  );
}

export default TeacherExamBuilder;
