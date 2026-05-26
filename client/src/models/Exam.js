// מודל מבחן שמשמש גם את המרצה וגם את הסטודנט.
export class Exam {
  constructor(id, title, course, status, teacherId, questions) {
    this.id = id;
    this.title = title;
    this.course = course;
    this.status = status;
    this.teacherId = teacherId;
    this.questions = questions;
  }
}
