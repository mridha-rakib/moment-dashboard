const getLocalStorage = (): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
};

export const browserStorage = {
  getString(key: string): string | null {
    return getLocalStorage()?.getItem(key) ?? null;
  },

  setString(key: string, value: string): void {
    getLocalStorage()?.setItem(key, value);
  },

  getJson<T>(key: string): T | null {
    const rawValue = this.getString(key);

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      this.remove(key);
      return null;
    }
  },

  setJson<T>(key: string, value: T): void {
    this.setString(key, JSON.stringify(value));
  },

  remove(key: string): void {
    getLocalStorage()?.removeItem(key);
  },
};
