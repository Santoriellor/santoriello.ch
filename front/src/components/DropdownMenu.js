import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import "../styles/DropdownMenu.css";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

import { LanguageContext } from "../contexts/LanguageContext";

const DropdownMenu = () => {
  const homeRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { translate } = useContext(LanguageContext);

  // Toggle the burger menu
  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === "home") {
            setIsVisible(!entry.isIntersecting);
          }
        });
      },
      { threshold: 0.5 }
    );

    const homeSection = document.getElementById("home");
    if (homeSection) {
      observer.observe(homeSection);
      homeRef.current = homeSection;
    }

    return () => {
      if (homeRef.current) {
        observer.unobserve(homeRef.current);
      }
    };
  }, []);

  return (
    <nav className={`navbar${isVisible ? "" : " hidden"}`}>
      <ThemeToggle />
      <div
        id="dropdown-links"
        className={`dropdown-links${menuOpen ? " open" : ""}`}
      >
        <a href="#home" onClick={() => setMenuOpen(false)}>
          {translate("home")}
        </a>
        <a href="#about-me" onClick={() => setMenuOpen(false)}>
          {translate("aboutMe")}
        </a>
        <a href="#my-work" onClick={() => setMenuOpen(false)}>
          {translate("myWork")}
        </a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>
          {translate("contact")}
        </a>
      </div>
      <button
        type="button"
        className="toggle-burger"
        aria-label="Menu"
        aria-expanded={menuOpen}
        aria-controls="dropdown-links"
        onClick={toggleMenu}
      >
        {menuOpen ? "✖" : "☰"}
      </button>
      <LanguageToggle />
    </nav>
  );
};

export default DropdownMenu;
