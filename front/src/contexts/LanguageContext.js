import React, { createContext, useState, useEffect } from "react";
import translations from "../assets/translations";

// Create the context
export const LanguageContext = createContext();

// Create the provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en",
  );

  // Function to update the language and save it to local storage
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const translate = (key) => {
    return translations[language][key] || key; // Fallback to the key if no translation is found
  };

  // Assistive technology picks pronunciation from <html lang>. Without this it
  // stays "en" from public/index.html and French and German copy is read with
  // English phonemes.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};
