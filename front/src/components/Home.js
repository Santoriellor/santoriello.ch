import React, { useEffect, useRef, useContext } from "react";
import "../styles/Home.css";
import CodeRain from "./CodeRain";
import NameLogo from "./NameLogo";

import { LanguageContext } from "../contexts/LanguageContext";

const Home = () => {
  const sectionRef = useRef(null);
  const { translate } = useContext(LanguageContext);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionSvgPath = entry.target.querySelectorAll(".svg-path");
          const sectionTagLine = entry.target.querySelector(".home-tagline");
          const sectionLinks = entry.target.querySelector(".home-links");
          if (entry.isIntersecting) {
            sectionSvgPath?.forEach((path) => {
              path?.classList.add("animate");
            });
            sectionTagLine?.classList.add("animate");
            sectionLinks?.classList.add("animate");
          } else {
            sectionSvgPath?.forEach((path) => {
              path?.classList.remove("animate");
            });
            sectionTagLine?.classList.remove("animate");
            sectionLinks?.classList.remove("animate");
          }
        });
      },
      { threshold: 0.5 },
    );

    const homeSection = document.getElementById("home");
    if (homeSection) {
      observer.observe(homeSection);
      sectionRef.current = homeSection;
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="home" className="home" ref={sectionRef}>
      <CodeRain />
      <div className="home-content">
        <h1 className="home-title">
          <NameLogo />
        </h1>
        <p className="home-tagline">{translate("homeTagLine")}</p>
        <div className="home-links">
          <a href="#about-me" className="home-btn">
            {translate("homeMoreBtn")}
          </a>
          <a href="#my-work" className="home-btn">
            {translate("myWork")}
          </a>
        </div>
      </div>
    </section>
  );
};

export default Home;
