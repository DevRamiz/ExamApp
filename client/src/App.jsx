import { useState } from "react";
import "./App.css";

const exams = [
  {
    id: 1,
    title: "JavaScript Basics",
    course: "Web Development",
    questions: 12,
    average: 86,
  },
  {
    id: 2,
    title: "React Components",
    course: "Frontend",
    questions: 10,
    average: 91,
  },
  {
    id: 3,
    title: "Git and GitHub",
    course: "Development Tools",
    questions: 8,
    average: 78,
  },
];

function TeacherDashboard() {
  return (
    <div className="card">
      <h2>Teacher Dashboard</h2>
      <p className="muted">View exams and class results.</p>

      <div className="exam-list">
        {exams.map((exam) => (
          <div className="exam-card" key={exam.id}>
            <h3>{exam.title}</h3>
            <p>Course: {exam.course}</p>
            <p>Questions: {exam.questions}</p>
            <p>Class Average: {exam.average}</p>
            <button>View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentPortal() {
  const [studentName, setStudentName] = useState("");

  return (
    <div className="card">
      <h2>Student Portal</h2>
      <p className="muted">Enter your name and choose an available exam.</p>

      <label>Student Name</label>
      <input
        type="text"
        placeholder="Enter your name"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
      />

      {studentName && <p className="welcome">Welcome, {studentName}!</p>}

      <div className="exam-list">
        {exams.map((exam) => (
          <div className="exam-card" key={exam.id}>
            <h3>{exam.title}</h3>
            <p>{exam.course}</p>
            <button>Start Exam</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [role, setRole] = useState("teacher");

  return (
    <main className="app">
      <header>
        <h1>E-Test System</h1>
        <p>React application for online exam management.</p>
      </header>

      <div className="role-buttons">
        <button onClick={() => setRole("teacher")}>Teacher View</button>
        <button onClick={() => setRole("student")}>Student View</button>
      </div>

      {role === "teacher" ? <TeacherDashboard /> : <StudentPortal />}
    </main>
  );
}

export default App;
