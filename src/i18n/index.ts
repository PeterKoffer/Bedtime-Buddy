import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import da from "./locales/da.json";
import en from "./locales/en.json";

const savedLang = typeof window !== "undefined" ? window.localStorage.getItem("appLang") : null;
const defaultLng = savedLang === "en" ? "en" : "da";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      da: { translation: da },
      en: { translation: en },
    },
    lng: defaultLng,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;