"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { secureStorage } from "@/lib/storage"

type Language = "uz" | "ru" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.dashboard": "Dashboard",
    "nav.logout": "Logout",
    "nav.doctors": "Doctors",
    "nav.pricing": "Pricing",
    "nav.profile": "Profile",
    "nav.notifications": "Notifications",

    // Hero
    "hero.title": "Your Health, Our Priority",
    "hero.subtitle":
      "Connect with qualified doctors online. Get medical consultations, prescriptions, and health advice from the comfort of your home.",
    "hero.cta": "Get Started",

    // Auth
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.fullName": "Full Name",
    "auth.firstName": "First Name",
    "auth.lastName": "Last Name",
    "auth.phone": "Phone Number",
    "auth.age": "Age",
    "auth.role": "Role",
    "auth.patient": "Patient",
    "auth.doctor": "Doctor",
    "auth.specialization": "Specialization",
    "auth.experience": "Years of Experience",
    "auth.bio": "Bio",
    "auth.consultationFee": "Consultation Fee",
    "auth.forgotPassword": "Forgot Password?",
    "auth.googleSignIn": "Sign in with Google",
    "auth.verifyEmail": "Verify Email",
    "auth.enterOTP": "Enter verification code",
    "auth.resendOTP": "Resend Code",
    "auth.termsAccept": "I accept the Terms and Conditions",
    "auth.privacyAccept": "I accept the Privacy Policy",

    // Dashboard
    "dashboard.welcome": "Welcome",
    "dashboard.uploadAnalysis": "Upload Analysis",
    "dashboard.chatWithAI": "Chat with AI",
    "dashboard.reminders": "Reminders",
    "dashboard.prescriptions": "Prescriptions",
    "dashboard.appointments": "Appointments",
    "dashboard.chats": "Chats",
    "dashboard.findDoctors": "Find Doctors",
    "dashboard.notes": "Notes",
    "dashboard.patients": "Patients",
    "dashboard.reviews": "Reviews",

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
    "common.date": "Date",
    "common.time": "Time",
    "common.status": "Status",
    "common.active": "Active",
    "common.inactive": "Inactive",
    "common.pending": "Pending",
    "common.completed": "Completed",
    "common.cancelled": "Cancelled",

    // Chat
    "chat.typeMessage": "Type your message...",
    "chat.sendImage": "Send Image",
    "chat.writePrescription": "Write Prescription",
    "chat.online": "Online",
    "chat.offline": "Offline",
    "chat.lastSeen": "Last seen",

    // Notifications
    "notification.newMessage": "New message from",
    "notification.appointmentReminder": "Appointment reminder",
    "notification.medicineReminder": "Medicine reminder",
    "notification.prescriptionReceived": "New prescription received",

    // Errors
    "error.invalidEmail": "Invalid email address",
    "error.weakPassword": "Password must be at least 8 characters with uppercase, lowercase, and numbers",
    "error.passwordMismatch": "Passwords do not match",
    "error.requiredField": "This field is required",
    "error.networkError": "Network error. Please try again.",
    "error.unauthorized": "Unauthorized access",
    "error.emailNotVerified": "Please verify your email address",
  },
  ru: {
    // Navigation
    "nav.home": "Главная",
    "nav.about": "О нас",
    "nav.contact": "Контакты",
    "nav.login": "Войти",
    "nav.signup": "Регистрация",
    "nav.dashboard": "Панель",
    "nav.logout": "Выйти",
    "nav.doctors": "Врачи",
    "nav.pricing": "Тарифы",
    "nav.profile": "Профиль",
    "nav.notifications": "Уведомления",

    // Hero
    "hero.title": "Ваше здоровье - наш приоритет",
    "hero.subtitle":
      "Свяжитесь с квалифицированными врачами онлайн. Получите медицинские консультации, рецепты и советы по здоровью не выходя из дома.",
    "hero.cta": "Начать",

    // Auth
    "auth.login": "Войти",
    "auth.signup": "Регистрация",
    "auth.email": "Email",
    "auth.password": "Пароль",
    "auth.confirmPassword": "Подтвердите пароль",
    "auth.fullName": "Полное имя",
    "auth.firstName": "Имя",
    "auth.lastName": "Фамилия",
    "auth.phone": "Номер телефона",
    "auth.age": "Возраст",
    "auth.role": "Роль",
    "auth.patient": "Пациент",
    "auth.doctor": "Врач",
    "auth.specialization": "Специализация",
    "auth.experience": "Лет опыта",
    "auth.bio": "Биография",
    "auth.consultationFee": "Стоимость консультации",
    "auth.forgotPassword": "Забыли пароль?",
    "auth.googleSignIn": "Войти через Google",
    "auth.verifyEmail": "Подтвердить email",
    "auth.enterOTP": "Введите код подтверждения",
    "auth.resendOTP": "Отправить код повторно",
    "auth.termsAccept": "Я принимаю Условия использования",
    "auth.privacyAccept": "Я принимаю Политику конфиденциальности",

    // Dashboard
    "dashboard.welcome": "Добро пожаловать",
    "dashboard.uploadAnalysis": "Загрузить анализы",
    "dashboard.chatWithAI": "Чат с ИИ",
    "dashboard.reminders": "Напоминания",
    "dashboard.prescriptions": "Рецепты",
    "dashboard.appointments": "Записи",
    "dashboard.chats": "Чаты",
    "dashboard.findDoctors": "Найти врачей",
    "dashboard.notes": "Заметки",
    "dashboard.patients": "Пациенты",
    "dashboard.reviews": "Отзывы",

    // Common
    "common.save": "Сохранить",
    "common.cancel": "Отмена",
    "common.delete": "Удалить",
    "common.edit": "Редактировать",
    "common.view": "Просмотр",
    "common.send": "Отправить",
    "common.loading": "Загрузка...",
    "common.error": "Ошибка",
    "common.success": "Успешно",
    "common.search": "Поиск",
    "common.filter": "Фильтр",
    "common.sort": "Сортировка",
    "common.date": "Дата",
    "common.time": "Время",
    "common.status": "Статус",
    "common.active": "Активный",
    "common.inactive": "Неактивный",
    "common.pending": "Ожидание",
    "common.completed": "Завершено",
    "common.cancelled": "Отменено",

    // Chat
    "chat.typeMessage": "Введите сообщение...",
    "chat.sendImage": "Отправить изображение",
    "chat.writePrescription": "Написать рецепт",
    "chat.online": "Онлайн",
    "chat.offline": "Оффлайн",
    "chat.lastSeen": "Был в сети",

    // Notifications
    "notification.newMessage": "Новое сообщение от",
    "notification.appointmentReminder": "Напоминание о записи",
    "notification.medicineReminder": "Напоминание о лекарстве",
    "notification.prescriptionReceived": "Получен новый рецепт",

    // Errors
    "error.invalidEmail": "Неверный email адрес",
    "error.weakPassword": "Пароль должен содержать минимум 8 символов с заглавными, строчными буквами и цифрами",
    "error.passwordMismatch": "Пароли не совпадают",
    "error.requiredField": "Это поле обязательно",
    "error.networkError": "Ошибка сети. Попробуйте снова.",
    "error.unauthorized": "Нет доступа",
    "error.emailNotVerified": "Пожалуйста, подтвердите ваш email адрес",
  },
  uz: {
    // Navigation
    "nav.home": "Bosh sahifa",
    "nav.about": "Biz haqimizda",
    "nav.contact": "Aloqa",
    "nav.login": "Kirish",
    "nav.signup": "Ro'yxatdan o'tish",
    "nav.dashboard": "Boshqaruv paneli",
    "nav.logout": "Chiqish",
    "nav.doctors": "Shifokorlar",
    "nav.pricing": "Narxlar",
    "nav.profile": "Profil",
    "nav.notifications": "Bildirishnomalar",

    // Hero
    "hero.title": "Sizning sog'ligingiz - bizning ustuvorligimiz",
    "hero.subtitle":
      "Malakali shifokorlar bilan onlayn bog'laning. Uyingizdan chiqmasdan tibbiy maslahatlar, retseptlar va sog'liq bo'yicha maslahatlar oling.",
    "hero.cta": "Boshlash",

    // Auth
    "auth.login": "Kirish",
    "auth.signup": "Ro'yxatdan o'tish",
    "auth.email": "Email",
    "auth.password": "Parol",
    "auth.confirmPassword": "Parolni tasdiqlang",
    "auth.fullName": "To'liq ism",
    "auth.firstName": "Ism",
    "auth.lastName": "Familiya",
    "auth.phone": "Telefon raqami",
    "auth.age": "Yosh",
    "auth.role": "Rol",
    "auth.patient": "Bemor",
    "auth.doctor": "Shifokor",
    "auth.specialization": "Mutaxassislik",
    "auth.experience": "Tajriba yillari",
    "auth.bio": "Biografiya",
    "auth.consultationFee": "Konsultatsiya narxi",
    "auth.forgotPassword": "Parolni unutdingizmi?",
    "auth.googleSignIn": "Google orqali kirish",
    "auth.verifyEmail": "Emailni tasdiqlash",
    "auth.enterOTP": "Tasdiqlash kodini kiriting",
    "auth.resendOTP": "Kodni qayta yuborish",
    "auth.termsAccept": "Men Foydalanish shartlarini qabul qilaman",
    "auth.privacyAccept": "Men Maxfiylik siyosatini qabul qilaman",

    // Dashboard
    "dashboard.welcome": "Xush kelibsiz",
    "dashboard.uploadAnalysis": "Tahlil yuklash",
    "dashboard.chatWithAI": "AI bilan suhbat",
    "dashboard.reminders": "Eslatmalar",
    "dashboard.prescriptions": "Retseptlar",
    "dashboard.appointments": "Uchrashuvlar",
    "dashboard.chats": "Suhbatlar",
    "dashboard.findDoctors": "Shifokorlarni topish",
    "dashboard.notes": "Eslatmalar",
    "dashboard.patients": "Bemorlar",
    "dashboard.reviews": "Sharhlar",

    // Common
    "common.save": "Saqlash",
    "common.cancel": "Bekor qilish",
    "common.delete": "O'chirish",
    "common.edit": "Tahrirlash",
    "common.view": "Ko'rish",
    "common.send": "Yuborish",
    "common.loading": "Yuklanmoqda...",
    "common.error": "Xato",
    "common.success": "Muvaffaqiyatli",
    "common.search": "Qidirish",
    "common.filter": "Filtr",
    "common.sort": "Saralash",
    "common.date": "Sana",
    "common.time": "Vaqt",
    "common.status": "Holat",
    "common.active": "Faol",
    "common.inactive": "Nofaol",
    "common.pending": "Kutilmoqda",
    "common.completed": "Tugallangan",
    "common.cancelled": "Bekor qilingan",

    // Chat
    "chat.typeMessage": "Xabar yozing...",
    "chat.sendImage": "Rasm yuborish",
    "chat.writePrescription": "Retsept yozish",
    "chat.online": "Onlayn",
    "chat.offline": "Oflayn",
    "chat.lastSeen": "Oxirgi marta ko'rilgan",

    // Notifications
    "notification.newMessage": "Yangi xabar",
    "notification.appointmentReminder": "Uchrashuvni eslatish",
    "notification.medicineReminder": "Dori eslatmasi",
    "notification.prescriptionReceived": "Yangi retsept olindi",

    // Errors
    "error.invalidEmail": "Noto'g'ri email manzil",
    "error.weakPassword":
      "Parol kamida 8 ta belgidan iborat bo'lishi va katta, kichik harflar hamda raqamlarni o'z ichiga olishi kerak",
    "error.passwordMismatch": "Parollar mos kelmaydi",
    "error.requiredField": "Bu maydon majburiy",
    "error.networkError": "Tarmoq xatosi. Qayta urinib ko'ring.",
    "error.unauthorized": "Ruxsat berilmagan",
    "error.emailNotVerified": "Iltimos, email manzilingizni tasdiqlang",
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

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = secureStorage.getItem("language") as Language
    if (savedLanguage && ["en", "ru", "uz"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    secureStorage.setItem("language", language)
    document.documentElement.lang = language
  }, [language])

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}
