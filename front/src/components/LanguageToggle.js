import React, { useContext, useState, useRef, useEffect } from "react";
import { LanguageContext } from "../contexts/LanguageContext";
import "../styles/LanguageToggle.css";

export default function LanguageToggle() {
    const { language, changeLanguage } = useContext(LanguageContext);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // SVG flags (React JSX, not strings)
    const FLAGS = {
        en: (
            <svg viewBox="0 0 60 30" width="22">
                <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
            </svg>
        ),
        fr: (
            <svg viewBox="0 0 3 2" width="22">
                <rect width="1" height="2" x="0" fill="#0055A4" />
                <rect width="1" height="2" x="1" fill="#fff" />
                <rect width="1" height="2" x="2" fill="#EF4135" />
            </svg>
        ),
        de: (
            <svg viewBox="0 0 5 3" width="22">
                <rect width="5" height="1" y="0" fill="#000" />
                <rect width="5" height="1" y="1" fill="#DD0000" />
                <rect width="5" height="1" y="2" fill="#FFCE00" />
            </svg>
        ),
    };

    const LANGUAGES = {
        en: { label: "EN", name: "English" },
        fr: { label: "FR", name: "Français" },
        de: { label: "DE", name: "Deutsch" },
    };

    // close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="lang-switcher" ref={ref}>
            <button className="lang-current" onClick={() => setOpen(!open)}>
                <span className="flag">{FLAGS[language]}</span>
                <span className="code">{LANGUAGES[language].label}</span>
                <span className="arrow">▾</span>
            </button>

            {open && (
                <div className="lang-menu">
                    {Object.keys(LANGUAGES).map((code) => (
                        <button
                            key={code}
                            className={`lang-item ${language === code ? "active" : ""}`}
                            onClick={() => {
                                changeLanguage(code);
                                setOpen(false);
                            }}
                        >
                            <span className="flag">{FLAGS[code]}</span>
                            <span>{LANGUAGES[code].name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}