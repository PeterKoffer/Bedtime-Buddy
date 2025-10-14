import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [lang, setLang] = useState<string>(i18n.language || "da");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("appLang");
      if (saved && (saved === "da" || saved === "en")) {
        i18n.changeLanguage(saved);
        setLang(saved);
      }
    } catch {
      // ignore
    }
  }, [i18n]);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    setLang(newLang);
    try {
      window.localStorage.setItem("appLang", newLang);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="lang" className="text-sm text-muted-foreground">{t("header.language")}</label>
      <select
        id="lang"
        value={lang}
        onChange={onChange}
        className="text-sm bg-transparent border rounded px-2 py-1 border-white/30 text-white"
      >
        <option value="da">{t("language.danish")}</option>
        <option value="en">{t("language.english")}</option>
      </select>
    </div>
  );
}