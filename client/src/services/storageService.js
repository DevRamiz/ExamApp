// שירות שמסתיר את העבודה הישירה מול localStorage.
class StorageService {
  get(key, fallbackValue) {
    const value = localStorage.getItem(key);
    if (!value) {
      return fallbackValue;
    }

    try {
      return JSON.parse(value);
    } catch {
      return fallbackValue;
    }
  }

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key) {
    localStorage.removeItem(key);
  }
}

export const storageService = new StorageService();
