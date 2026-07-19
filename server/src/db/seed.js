import bcrypt from "bcryptjs";
import { pool } from "./pool.js";
import { env } from "../config/env.js";

if (!env.seedDatabase) {
  console.log("Database seed skipped (SEED_DATABASE=false). ");
  await pool.end();
  process.exit(0);
}

const passwordHash = await bcrypt.hash("123456", 12);

const sampleQuestions = [
  {
    id: "q1",
    type: "multiple_choice",
    text: "Which HTTP method is normally used to create a resource?",
    options: ["GET", "POST", "DELETE", "HEAD"],
    correctAnswer: "POST",
    points: 25
  },
  {
    id: "q2",
    type: "multiple_choice",
    text: "Which database feature stores structured JSON efficiently in PostgreSQL?",
    options: ["CSV", "JSONB", "XML only", "VARCHAR only"],
    correctAnswer: "JSONB",
    points: 25
  },
  {
    id: "q3",
    type: "text",
    text: "Explain one reason for validating input on the server.",
    points: 25
  },
  {
    id: "q4",
    type: "text",
    text: "Describe the role of an API between a client and a database.",
    points: 25
  }
];

try {
  const users = [
    ["System Admin", "admin@test.com", "admin"],
    ["Demo Teacher", "teacher@test.com", "teacher"],
    ["Demo Student", "student@test.com", "student"],
    ["Second Student", "student2@test.com", "student"]
  ];

  for (const [name, email, role] of users) {
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [name, email, passwordHash, role]
    );
  }

  const teacher = await pool.query("SELECT id FROM users WHERE email = $1", ["teacher@test.com"]);
  const teacherId = teacher.rows[0].id;

  await pool.query(
    `INSERT INTO exams (lecturer_id, title, description, duration_minutes, status, questions, published_at)
     SELECT $1::integer, $2::varchar(180), $3::text, $4::integer,
            'published'::varchar(20), $5::jsonb, NOW()
     WHERE NOT EXISTS (
       SELECT 1
       FROM exams
       WHERE title = $2::varchar(180)
         AND lecturer_id = $1::integer
     )`,
    [teacherId, "Web Development Fundamentals", "A sample published exam for the final-project demonstration.", 45, JSON.stringify(sampleQuestions)]
  );

  await pool.query(
    `INSERT INTO exams (lecturer_id, title, description, duration_minutes, status, questions)
     SELECT $1::integer, $2::varchar(180), $3::text, $4::integer,
            'draft'::varchar(20), $5::jsonb
     WHERE NOT EXISTS (
       SELECT 1
       FROM exams
       WHERE title = $2::varchar(180)
         AND lecturer_id = $1::integer
     )`,
    [teacherId, "Draft React Exam", "A draft that demonstrates the lecturer workflow.", 30, JSON.stringify(sampleQuestions.slice(0, 2))]
  );

  console.log("Database seed completed.");
} catch (error) {
  console.error("Database seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
