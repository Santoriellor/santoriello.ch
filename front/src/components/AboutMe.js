import React, { useEffect, useRef, useContext } from "react";
import "../styles/AboutMe.css";

import { LanguageContext } from "../contexts/LanguageContext";

const skills = [
  { name: "HTML", level: 90 },
  { name: "CSS", level: 85 },
  { name: "JavaScript", level: 85 },
  /* { name: 'TypeScript', level: 80 }, */
  { name: "React", level: 75 },
  { name: "Python", level: 85 },
  { name: "PHP", level: 70 },
  { name: "Django", level: 70 },
  { name: "MySQL", level: 75 },
  { name: "NGINX", level: 65 },
];

const AboutMe = () => {
  const sectionRef = useRef(null);
  const { translate } = useContext(LanguageContext);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.target) return;

          const sectionTitle = entry.target.querySelector(".about-me-title");
          const sectionSeparator = entry.target.querySelector(".separator");
          const sectionAboutDescr =
            entry.target.querySelector(".about-description");
          const sectionSkills = entry.target.querySelector(".about-skills");
          const progressBarFills =
            entry.target.querySelectorAll(".progress-bar-fill");
          if (entry.isIntersecting) {
            sectionTitle?.classList.add("animate");
            sectionSeparator?.classList.add("animate");
            sectionAboutDescr?.classList.add("animate");
            sectionSkills?.classList.add("animate");
            progressBarFills?.forEach((fill) => {
              fill.classList.add("animate");
            });
          } else {
            sectionTitle?.classList.remove("animate");
            sectionSeparator?.classList.remove("animate");
            sectionAboutDescr?.classList.remove("animate");
            sectionSkills?.classList.remove("animate");
            progressBarFills?.forEach((fill) => {
              fill.classList.remove("animate");
            });
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about-me" className="about-me" ref={sectionRef}>
      <h1 className="about-me-title">&lt; {translate("about")} &gt;</h1>
      <div className="separator"></div>
      <div className="about-content">
        <div className="about-description">
          <img src="/images/me.png" alt="Your Name" />
          <h2>{translate("aboutMe")}</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>
            {translate("aboutText1")}
            <a
              className="description-links"
              href="https://www.defense.gouv.fr/terre/section-technique-larmee-terre-stat"
            >
              {translate("aboutText2")}
            </a>
            {translate("aboutText3")}
            <br />
            <a className="description-links" href="#contact">
              {translate("aboutTextContact")}
            </a>
          </p>
        </div>
        <div className="about-skills">
          {skills.map((skill, index) => (
            <div key={index} className="skill">
              <span>{skill.name}</span>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ "--level": `${skill.level}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutMe;
