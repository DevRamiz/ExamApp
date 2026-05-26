import { User } from "../models/User";
import { Exam } from "../models/Exam";
import { Question } from "../models/Question";

export const defaultUsers = [
  new User(1, "Teacher Demo", "teacher@test.com", "123456", "teacher"),
  new User(2, "Student Demo", "student@test.com", "123456", "student"),
];

export const defaultExams = [
  new Exam(1, "JavaScript Basics", "Web Development", "published", 1, [
    new Question(1, "Which keyword declares a constant?", ["let", "const", "var", "static"], "const"),
    new Question(2, "What does DOM mean?", ["Document Object Model", "Data Object Map", "Digital Order Method", "Design Object Mode"], "Document Object Model"),
  ]),
  new Exam(2, "React Components", "Frontend", "draft", 1, [
    new Question(1, "React components return what?", ["HTML string", "JSX", "CSS", "SQL"], "JSX"),
    new Question(2, "Which hook stores component state?", ["useState", "useFetch", "useClass", "useCSS"], "useState"),
  ]),
  new Exam(3, "Git and GitHub", "Development Tools", "published", 1, [
    new Question(1, "Which command creates a commit?", ["git push", "git commit", "git clone", "git status"], "git commit"),
    new Question(2, "Which branch is used for development in this project?", ["main", "dev", "release", "hotfix"], "dev"),
  ]),
];

export const defaultSubmissions = [];
