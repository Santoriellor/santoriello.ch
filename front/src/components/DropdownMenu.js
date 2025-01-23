import React, { useState, useEffect, useRef } from "react";
import "../styles/DropdownMenu.css";
import ThemeToggle from "./ThemeToggle";
import LangToggle from "./LangToggle";

function DropdownMenu() {
  const homeRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

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
    <nav className={`dropdown-menu${isVisible ? "" : " hidden"}`}>
      <ThemeToggle />
      <div>
        <a href="#home">Home</a>
        <a href="#about-me">About Me</a>
        <a href="#my-work">My Work</a>
        <a href="#contact">Contact</a>
      </div>
      <LangToggle />
    </nav>
  );
}

export default DropdownMenu;
