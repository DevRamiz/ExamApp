// שירות הגדרות מרכזי לאפליקציה.
class ConfigService {
  constructor() {
    this.appName = "E-Test System";
    this.version = "1.0.0";
    this.storageKeys = {
      users: "examapp_users",
      exams: "examapp_exams",
      currentUser: "examapp_current_user",
      submissions: "examapp_submissions",
    };
  }

  getAppName() {
    return this.appName;
  }

  getStorageKey(key) {
    return this.storageKeys[key];
  }
}

export const configService = new ConfigService();
