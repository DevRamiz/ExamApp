import http from "node:http";

const port = Number(process.env.PORT || 4101);
const provider = process.env.AI_PROVIDER || "local";

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1_000_000) throw new Error("Request is too large.");
  }
  return raw ? JSON.parse(raw) : {};
}

function localQuestions({ topic = "General knowledge", count = 3, difficulty = "medium", types = ["multiple_choice", "text"] }) {
  const safeCount = Math.min(Math.max(Number(count) || 3, 1), 10);
  const allowed = Array.isArray(types) && types.length ? types : ["multiple_choice", "text"];
  return Array.from({ length: safeCount }, (_, index) => {
    const type = allowed[index % allowed.length] === "text" ? "text" : "multiple_choice";
    if (type === "text") {
      return {
        id: crypto.randomUUID(),
        type,
        text: `Explain an important ${difficulty} concept related to ${topic}.`,
        points: 10
      };
    }
    const correct = `A correct ${topic} concept`;
    return {
      id: crypto.randomUUID(),
      type,
      text: `Which option best describes a ${difficulty} concept in ${topic}?`,
      options: [correct, `An unrelated ${topic} idea`, "None of the above", "All answers are identical"],
      correctAnswer: correct,
      points: 10
    };
  });
}

function localFeedback({ submission }) {
  const answers = submission?.answers || [];
  const blank = answers.filter((answer) => !String(answer.value || "").trim()).length;
  const manualQuestions = answers.filter((answer) => Number(answer.manualPoints || 0) >= 0 && answer.teacherComment !== undefined).length;
  return `The submission is complete and ready for lecturer review. ${blank ? `${blank} answer(s) are blank. ` : "All saved answers contain content. "}${manualQuestions ? "Review the open answers for accuracy, clarity, and use of course terminology." : "Automatic grading is available for the objective questions."}`;
}

function extractJson(text) {
  const cleaned = String(text || "").replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned);
}

async function externalAi(path, payload) {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL;
  if (!apiKey) throw new Error("AI_API_KEY is missing.");
  if (!model) throw new Error("AI_MODEL is missing.");

  const task = path === "/generate-questions"
    ? `Return JSON only with a questions array. Create ${payload.count || 3} ${payload.difficulty || "medium"} exam questions about ${payload.topic || "general knowledge"}. Allowed types: ${(payload.types || ["multiple_choice", "text"]).join(", ")}. Each question needs id, type, text, points; multiple_choice also needs four options and correctAnswer.`
    : `Return JSON only with a feedback string. Suggest concise lecturer feedback for this submission: ${JSON.stringify(payload.submission || {})}`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, temperature: 0.3, messages: [{ role: "system", content: "You are a careful teaching assistant. Output valid JSON only." }, { role: "user", content: task }] })
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}.`);
  const data = await response.json();
  return extractJson(data.choices?.[0]?.message?.content);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/health") return send(res, 200, { status: "ok", service: "examflow-ai", provider });
    if (req.method !== "POST" || !["/generate-questions", "/feedback-suggestion"].includes(req.url)) return send(res, 404, { error: "Route not found." });
    const payload = await readJson(req);
    if (provider !== "local") return send(res, 200, await externalAi(req.url, payload));
    if (req.url === "/generate-questions") return send(res, 200, { questions: localQuestions(payload), provider: "local" });
    return send(res, 200, { feedback: localFeedback(payload), provider: "local" });
  } catch (error) {
    send(res, 500, { error: error.message || "AI service failed." });
  }
});

server.listen(port, () => console.log(`ExamFlow AI service listening on ${port} (${provider})`));
