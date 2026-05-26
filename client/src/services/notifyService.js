// שירות הודעות. כרגע משתמש ב-alert פשוט כדי לא להוסיף ספריות חיצוניות.
class NotifyService {
  success(message) {
    alert(message);
  }

  error(message) {
    alert(message);
  }
}

export const notifyService = new NotifyService();
