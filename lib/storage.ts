// Secure storage utilities
class SecureStorage {
  private prefix = "salomat_"

  setItem(key: string, value: any): void {
    try {
      const encrypted = btoa(JSON.stringify(value))
      localStorage.setItem(this.prefix + key, encrypted)
    } catch (error) {
      console.error("Storage error:", error)
    }
  }

  getItem(key: string): any {
    try {
      const item = localStorage.getItem(this.prefix + key)
      if (!item) return null
      return JSON.parse(atob(item))
    } catch (error) {
      console.error("Storage error:", error)
      return null
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key)
  }

  clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }
}

class SessionStore {
  private prefix = "salomat_session_"

  set(key: string, value: any): void {
    try {
      sessionStorage.setItem(this.prefix + key, JSON.stringify(value))
    } catch (error) {
      console.error("Session storage error:", error)
    }
  }

  get(key: string): any {
    try {
      const item = sessionStorage.getItem(this.prefix + key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error("Session storage error:", error)
      return null
    }
  }

  remove(key: string): void {
    sessionStorage.removeItem(this.prefix + key)
  }

  clear(): void {
    const keys = Object.keys(sessionStorage)
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        sessionStorage.removeItem(key)
      }
    })
  }
}

export const secureStorage = new SecureStorage()
export const sessionStore = new SessionStore()
