import { defaultExams, defaultSubmissions, defaultUsers } from "./mockDb";
import { configService } from "../services/configService";
import { storageService } from "../services/storageService";
import { loggerService } from "../services/loggerService";

// שירות API מדומה. אין שרת אמיתי, כל המידע נשמר ב-localStorage.
class MockApiService {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    const users = storageService.get(configService.getStorageKey("users"), null);
    const exams = storageService.get(configService.getStorageKey("exams"), null);
    const submissions = storageService.get(configService.getStorageKey("submissions"), null);

    if (!users) storageService.set(configService.getStorageKey("users"), defaultUsers);
    if (!exams) storageService.set(configService.getStorageKey("exams"), defaultExams);
    if (!submissions) storageService.set(configService.getStorageKey("submissions"), defaultSubmissions);
  }

  register(name, email, password, role) {
    const users = this.getUsers();
    const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role,
    };

    users.push(newUser);
    storageService.set(configService.getStorageKey("users"), users);
    loggerService.info("Registered new user", newUser);
    return newUser;
  }

  login(email, password) {
    const users = this.getUsers();
    const user = users.find((item) => item.email === email && item.password === password);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    storageService.set(configService.getStorageKey("currentUser"), user);
    loggerService.info("User logged in", user);
    return user;
  }

  logout() {
    storageService.remove(configService.getStorageKey("currentUser"));
  }

  getCurrentUser() {
    return storageService.get(configService.getStorageKey("currentUser"), null);
  }

  getUsers() {
    return storageService.get(configService.getStorageKey("users"), defaultUsers);
  }

  getExams() {
    return storageService.get(configService.getStorageKey("exams"), defaultExams);
  }

  getPublishedExams() {
    return this.getExams().filter((exam) => exam.status === "published");
  }

  createExam(title, course, teacherId) {
    const exams = this.getExams();
    const newExam = {
      id: Date.now(),
      title,
      course,
      status: "draft",
      teacherId,
      questions: [],
    };

    exams.push(newExam);
    storageService.set(configService.getStorageKey("exams"), exams);
    loggerService.info("Created exam", newExam);
    return newExam;
  }

  addQuestion(examId, questionText, options, correctAnswer) {
    const exams = this.getExams();
    const exam = exams.find((item) => item.id === examId);

    if (!exam) {
      throw new Error("Exam not found");
    }

    exam.questions.push({
      id: Date.now(),
      text: questionText,
      options,
      correctAnswer,
    });

    storageService.set(configService.getStorageKey("exams"), exams);
    return exam;
  }

  changeExamStatus(examId, status) {
    const exams = this.getExams();
    const exam = exams.find((item) => item.id === examId);

    if (!exam) {
      throw new Error("Exam not found");
    }

    exam.status = status;
    storageService.set(configService.getStorageKey("exams"), exams);
    loggerService.info("Changed exam status", { examId, status });
    return exam;
  }

  submitExam(examId, studentId, answers) {
    const exams = this.getExams();
    const exam = exams.find((item) => item.id === examId);

    if (!exam) {
      throw new Error("Exam not found");
    }

    let score = 0;
    exam.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        score += 1;
      }
    });

    const submission = {
      id: Date.now(),
      examId,
      studentId,
      answers,
      score,
      total: exam.questions.length,
      submittedAt: new Date().toLocaleString(),
    };

    const submissions = storageService.get(configService.getStorageKey("submissions"), []);
    submissions.push(submission);
    storageService.set(configService.getStorageKey("submissions"), submissions);
    loggerService.info("Submitted exam", submission);
    return submission;
  }

  getSubmissions() {
    return storageService.get(configService.getStorageKey("submissions"), []);
  }
}

export const mockApiService = new MockApiService();
