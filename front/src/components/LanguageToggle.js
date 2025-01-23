import React, { useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";
import "../styles/LanguageToggle.css";

const LanguageToggle = () => {
  const { language, changeLanguage } = useContext(LanguageContext);

  return (
    <div className="language-toggle">
      <select
        className="language-select"
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        <option value="en">🇬🇧</option>
        <option value="fr">🇫🇷</option>
        <option value="de">🇩🇪</option>
      </select>
    </div>
  );
};

export default LanguageToggle;
