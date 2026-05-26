// שירות לוגים פשוט למעקב אחרי פעולות במערכת.
class LoggerService {
  info(message, data = null) {
    console.log(`[INFO] ${message}`, data || "");
  }

  error(message, error = null) {
    console.error(`[ERROR] ${message}`, error || "");
  }
}

export const loggerService = new LoggerService();
