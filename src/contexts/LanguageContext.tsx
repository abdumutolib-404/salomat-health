"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "uz" | "ru" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  uz: {
    // Navigation
    "nav.home": "Bosh sahifa",
    "nav.doctors": "Shifokorlar",
    "nav.about": "Haqida",
    "nav.pricing": "Narxlar",
    "nav.login": "Kirish",
    "nav.signup": "Ro'yxatdan o'tish",
    "nav.dashboard": "Boshqaruv paneli",
    "nav.profile": "Profil",
    "nav.notifications": "Bildirishnomalar",
    "nav.logout": "Chiqish",

    // Auth
    "auth.login": "Kirish",
    "auth.signup": "Ro'yxatdan o'tish",
    "auth.email": "Email",
    "auth.password": "Parol",
    "auth.confirmPassword": "Parolni tasdiqlang",
    "auth.firstName": "Ism",
    "auth.lastName": "Familiya",
    "auth.phone": "Telefon",
    "auth.age": "Yosh",
    "auth.role": "Rol",
    "auth.patient": "Bemor",
    "auth.doctor": "Shifokor",
    "auth.specialization": "Mutaxassislik",
    "auth.experience": "Tajriba (yil)",
    "auth.bio": "Haqida",
    "auth.consultationFee": "Konsultatsiya narxi",
    "auth.forgotPassword": "Parolni unutdingizmi?",
    "auth.googleSignIn": "Google orqali kirish",
    "auth.termsAccept": "Foydalanish shartlarini qabul qilaman",
    "auth.privacyAccept": "Maxfiylik siyosatini qabul qilaman",
    "auth.verifyEmail": "Emailni tasdiqlang",
    "auth.enterOTP": "Tasdiqlash kodini kiriting",
    "auth.resendOTP": "Kodni qayta yuborish",

    // Dashboard
    "dashboard.welcome": "Xush kelibsiz",
    "dashboard.chats": "Suhbatlar",
    "dashboard.chatWithAI": "AI bilan suhbat",
    "dashboard.findDoctors": "Shifokorlarni topish",
    "dashboard.appointments": "Uchrashuvlar",
    "dashboard.prescriptions": "Retseptlar",
    "dashboard.notes": "Eslatmalar",
    "dashboard.uploadAnalysis": "Tahlil yuklash",

    // Common
    "common.save": "Saqlash",
    "common.cancel": "Bekor qilish",
    "common.delete": "O'chirish",
    "common.edit": "Tahrirlash",
    "common.view": "Ko'rish",
    "common.send": "Yuborish",
    "common.loading": "Yuklanmoqda...",
    "common.error": "Xatolik",
    "common.success": "Muvaffaqiyat",
    "common.search": "Qidirish",
    "common.filter": "Filtr",
    "common.sort": "Saralash",

    // Errors
    "error.requiredField": "Bu maydon majburiy",
    "error.invalidEmail": "Noto'g'ri email format",
    "error.weakPassword": "Parol kamida 8 ta belgi bo'lishi kerak",
    "error.passwordMismatch": "Parollar mos kelmaydi",
    "error.networkError": "Tarmoq xatoligi",
    "error.unauthorized": "Ruxsat berilmagan",
    "error.notFound": "Topilmadi",
  },
  ru: {
    // Navigation
    "nav.home": "Главная",
    "nav.doctors": "Врачи",
    "nav.about": "О нас",
    "nav.pricing": "Цены",
    "nav.login": "Войти",
    "nav.signup": "Регистрация",
    "nav.dashboard": "Панель управления",
    "nav.profile": "Профиль",
    "nav.notifications": "Уведомления",
    "nav.logout": "Выйти",

    // Auth
    "auth.login": "Войти",
    "auth.signup": "Регистрация",
    "auth.email": "Email",
    "auth.password": "Пароль",
    "auth.confirmPassword": "Подтвердите пароль",
    "auth.firstName": "Имя",
    "auth.lastName": "Фамилия",
    "auth.phone": "Телефон",
    "auth.age": "Возраст",
    "auth.role": "Роль",
    "auth.patient": "Пациент",
    "auth.doctor": "Врач",
    "auth.specialization": "Специализация",
    "auth.experience": "Опыт (лет)",
    "auth.bio": "О себе",
    "auth.consultationFee": "Стоимость консультации",
    "auth.forgotPassword": "Забыли пароль?",
    "auth.googleSignIn": "Войти через Google",
    "auth.termsAccept": "Принимаю условия использования",
    "auth.privacyAccept": "Принимаю политику конфиденциальности",
    "auth.verifyEmail": "Подтвердить email",
    "auth.enterOTP": "Введите код подтверждения",
    "auth.resendOTP": "Отправить код повторно",

    // Dashboard
    "dashboard.welcome": "Добро пожаловать",
    "dashboard.chats": "Чаты",
    "dashboard.chatWithAI": "Чат с ИИ",
    "dashboard.findDoctors": "Найти врачей",
    "dashboard.appointments": "Записи",
    "dashboard.prescriptions": "Рецепты",
    "dashboard.notes": "Заметки",
    "dashboard.uploadAnalysis": "Загрузить анализ",

    // Common
    "common.save": "Сохранить",
    "common.cancel": "Отмена",
    "common.delete": "Удалить",
    "common.edit": "Редактировать",
    "common.view": "Просмотр",
    "common.send": "Отправить",
    "common.loading": "Загрузка...",
    "common.error": "Ошибка",
    "common.success": "Успех",
    "common.search": "Поиск",
    "common.filter": "Фильтр",
    "common.sort": "Сортировка",

    // Errors
    "error.requiredField": "Это поле обязательно",
    "error.invalidEmail": "Неверный формат email",
    "error.weakPassword": "Пароль должен содержать минимум 8 символов",
    "error.passwordMismatch": "Пароли не совпадают",
    "error.networkError": "Ошибка сети",
    "error.unauthorized": "Нет доступа",
    "error.notFound": "Не найдено",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.doctors": "Doctors",
    "nav.about": "About",
    "nav.pricing": "Pricing",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.dashboard": "Dashboard",
    "nav.profile": "Profile",
    "nav.notifications": "Notifications",
    "nav.logout": "Logout",

    // Auth
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.firstName": "First Name",
    "auth.lastName": "Last Name",
    "auth.phone": "Phone",
    "auth.age": "Age",
    "auth.role": "Role",
    "auth.patient": "Patient",
    "auth.doctor": "Doctor",
    "auth.specialization": "Specialization",
    "auth.experience": "Experience (years)",
    "auth.bio": "Bio",
    "auth.consultationFee": "Consultation Fee",
    "auth.forgotPassword": "Forgot Password?",
    "auth.googleSignIn": "Sign in with Google",
    "auth.termsAccept": "I accept the terms of service",
    "auth.privacyAccept": "I accept the privacy policy",
    "auth.verifyEmail": "Verify Email",
    "auth.enterOTP": "Enter verification code",
    "auth.resendOTP": "Resend code",

    // Dashboard
    "dashboard.welcome": "Welcome",
    "dashboard.chats": "Chats",
    "dashboard.chatWithAI": "AI Chat",
    "dashboard.findDoctors": "Find Doctors",
    "dashboard.appointments": "Appointments",
    "dashboard.prescriptions": "Prescriptions",
    "dashboard.notes": "Notes",
    "dashboard.uploadAnalysis": "Upload Analysis",

    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.send": "Send",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",

    // Errors
    "error.requiredField": "This field is required",
    "error.invalidEmail": "Invalid email format",
    "error.weakPassword": "Password must be at least 8 characters",
    "error.passwordMismatch": "Passwords do not match",
    "error.networkError": "Network error",
    "error.unauthorized": "Unauthorized",
    "error.notFound": "Not found",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && ["uz", "ru", "en"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
