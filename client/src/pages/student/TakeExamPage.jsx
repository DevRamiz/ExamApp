import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../api/http.js";

function toAnswerArray(values) {
  return Object.entries(values).map(([questionId, value]) => ({ questionId, value }));
}
function formatRemaining(milliseconds) {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export default function TakeExamPage() {
  const { examId } = useParams(); const navigate = useNavigate();
  const [submission, setSubmission] = useState(null); const [answers, setAnswers] = useState({}); const [saveStatus, setSaveStatus] = useState(""); const [error, setError] = useState(""); const [remaining, setRemaining] = useState(null); const [tabSwitches, setTabSwitches] = useState(0); const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const answersRef = useRef(answers); const tabSwitchesRef = useRef(tabSwitches); const currentQuestionRef = useRef(currentQuestionId); const submittingRef = useRef(false);
  answersRef.current = answers; tabSwitchesRef.current = tabSwitches; currentQuestionRef.current = currentQuestionId;

  useEffect(() => { apiRequest(`/exams/${examId}/start`, { method: "POST" }).then(({ submission: data }) => { setSubmission(data); const initial = {}; for (const answer of data.answers || []) initial[answer.questionId] = answer.value; setAnswers(initial); }).catch((err) => setError(err.message)); }, [examId]);

  useEffect(() => {
    if (!submission?.deadlineAt || submission.status !== "in_progress") return undefined;
    const update = () => setRemaining(new Date(submission.deadlineAt).getTime() - Date.now());
    update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer);
  }, [submission]);

  useEffect(() => {
    const hidden = () => { if (document.hidden && submission?.status === "in_progress") setTabSwitches((value) => value + 1); };
    document.addEventListener("visibilitychange", hidden); return () => document.removeEventListener("visibilitychange", hidden);
  }, [submission]);

  useEffect(() => {
    if (!submission || submission.status !== "in_progress") return undefined;
    const timer = window.setInterval(async () => {
      try { setSaveStatus("Saving..."); await apiRequest(`/submissions/${submission.id}/autosave`, { method: "PATCH", body: JSON.stringify({ answers: toAnswerArray(answersRef.current) }) }); setSaveStatus(`Saved at ${new Date().toLocaleTimeString()}`); } catch (err) { setSaveStatus(err.message.includes("time has ended") ? "Time ended — submit now" : "Auto-save failed"); }
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [submission]);

  useEffect(() => {
    if (!submission || submission.status !== "in_progress") return undefined;
    const token = localStorage.getItem("examflow_token");
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const base = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(`${base}${base.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`);
    const heartbeat = () => {
      if (socket.readyState !== WebSocket.OPEN) return;
      socket.send(JSON.stringify({ type: "exam_heartbeat", submissionId: submission.id, examId: submission.examId, answeredCount: Object.values(answersRef.current).filter((value) => String(value || "").trim()).length, currentQuestionId: currentQuestionRef.current, tabSwitches: tabSwitchesRef.current }));
    };
    socket.onopen = heartbeat;
    const timer = window.setInterval(heartbeat, 15_000);
    return () => { window.clearInterval(timer); socket.close(); };
  }, [submission]);

  const answeredCount = useMemo(() => Object.values(answers).filter((value) => String(value || "").trim()).length, [answers]);
  async function saveAndLeave() { try { await apiRequest(`/submissions/${submission.id}/autosave`, { method: "PATCH", body: JSON.stringify({ answers: toAnswerArray(answers) }) }); navigate("/student"); } catch (err) { setError(err.message); } }
  async function submitExam(force = false) { if (submittingRef.current) return; if (!force && !confirm("Submit the exam? You cannot change the answers afterwards.")) return; submittingRef.current = true; try { await apiRequest(`/submissions/${submission.id}/submit`, { method: "POST", body: JSON.stringify({ answers: toAnswerArray(answersRef.current) }) }); navigate("/student/results"); } catch (err) { setError(err.message); submittingRef.current = false; } }
  useEffect(() => { if (remaining != null && remaining <= 0 && submission?.status === "in_progress") submitExam(true); }, [remaining, submission]);

  if (error && !submission) return <div className="alert alert-error">{error}</div>;
  if (!submission) return <div className="card">Loading exam...</div>;
  if (submission.status !== "in_progress") return <div className="card empty-state"><h2>This attempt is already {submission.status.replaceAll("_", " ")}.</h2><p>Open My Results to check its current state.</p><button className="button button-primary" onClick={() => navigate("/student/results")}>My results</button></div>;

  return <div><header className="page-header exam-header"><div><p className="eyebrow">Active exam</p><h1>{submission.exam.title}</h1><p>{submission.exam.description}</p></div><div className="exam-progress"><strong>{answeredCount}/{submission.exam.questions.length}</strong><span>answered</span><b className={remaining != null && remaining < 300_000 ? "timer-warning" : ""}>{remaining == null ? "--:--:--" : formatRemaining(remaining)}</b><small>{saveStatus || "Auto-save every 10 seconds"}</small></div></header><div className="monitoring-notice">Progress, connection status, and tab visibility changes are sent to the lecturer for supervision. These signals are not automatic cheating decisions.</div>{error && <div className="alert alert-error">{error}</div>}<div className="form-stack">{submission.exam.questions.map((question, index) => <section className="card exam-question" key={question.id} onFocus={() => setCurrentQuestionId(question.id)}><div className="question-header"><strong>{index + 1}. {question.text}</strong><span>{question.points} points</span></div>{question.type === "multiple_choice" ? <div className="answer-options">{question.options.map((option) => <label key={option} className={`answer-option ${answers[question.id] === option ? "selected" : ""}`}><input type="radio" name={question.id} value={option} checked={answers[question.id] === option} onChange={() => setAnswers({ ...answers, [question.id]: option })} /><span>{option}</span></label>)}</div> : <textarea rows="6" placeholder="Write your answer..." value={answers[question.id] || ""} onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })} />}</section>)}<div className="sticky-actions"><button className="button button-secondary" onClick={saveAndLeave}>Save and leave</button><button className="button button-primary" onClick={() => submitExam(false)}>Submit exam</button></div></div></div>;
}
