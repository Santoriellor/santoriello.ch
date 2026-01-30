import React, { useState, useRef, useEffect, useContext } from "react";
import "../styles/MyWork.css";

import { LanguageContext } from "../contexts/LanguageContext";

const projects = [
  {
    id: 1,
    name: "La Ferme",
    front: ["HTML", "CSS", "JavaScript", "React"],
    back: ["None required"],
    url: "/images/projects/laferme.jpg",
    http: "https://website.santoriello.ch",
  },
  /* {
    id: 2,
    name: "Price Comparator",
    front: ["HTML", "CSS", "JavaScript"],
    back: ["Python", "Django", "MySQL"],
    url: "/images/projects/comparator.jpg",
    http: "https://comparator.santoriello.ch",
  }, */
  {
    id: 3,
    name: "Workshop",
    front: ["HTML", "CSS", "JavaScript", "React"],
    back: ["Python", "Django", "MySQL"],
    url: "/images/projects/workshop.jpg",
    http: "https://workshop.santoriello.ch",
  },
  {
    id: 4,
    name: "S.I.R",
    front: ["HTML", "CSS", "JavaScript"],
    back: ["PHP", "MySQL"],
    url: "/images/projects/sir.jpg",
    http: "https://www.defense.gouv.fr/terre/section-technique-larmee-terre-stat/",
  },
    {
        id: 5,
        name: "Space Invader",
        front: ["Typescript", "Angular"],
        back: ["Java", "SpringBoot", "PostgreSQL"],
        url: "/images/projects/space-multi.jpg",
        http: "https://simulti.santoriello.ch/",
    },
];

const MyWork = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [rotate, setRotate] = useState(false);
  const filters = ["All", "React", "Python", "Django", "MySQL"];
  const sectionRef = useRef(null);
  const { translate } = useContext(LanguageContext);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.target) return;

          const sectionTitle = entry.target.querySelector(".my-work-title");
          const sectionSeparator = entry.target.querySelector(".separator");
          const sectionAboutDescr = entry.target.querySelector(".filters");
          const progressBarFills = entry.target.querySelectorAll(".project");
          if (entry.isIntersecting) {
            sectionTitle?.classList.add("animate");
            sectionSeparator?.classList.add("animate");
            sectionAboutDescr?.classList.add("animate");
            progressBarFills?.forEach((fill) => {
              fill.classList.add("animate");
            });
          } else {
            sectionTitle?.classList.remove("animate");
            sectionSeparator?.classList.remove("animate");
            sectionAboutDescr?.classList.remove("animate");
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

  useEffect(() => {
    // Refresh animations when the activeFilter changes
    const projects = document.querySelectorAll(".project");
    projects.forEach((project) => {
      project.classList.add("animate");
    });
  }, [activeFilter]);

  const handleButtonClick = (filter) => {
    if (activeFilter === filter) return;
    setRotate(true);
    setActiveFilter(filter);
    setTimeout(() => setRotate(false), 500);
  };

  const filteredProjects =
    activeFilter === "All"
      ? projects
      : projects.filter(
          (p) =>
            (p.front && p.front.includes(activeFilter)) ||
            (p.back && p.back.includes(activeFilter))
        );

  return (
    <section id="my-work" className="my-work" ref={sectionRef}>
      <h1 className="my-work-title">&lt; {translate("myWork")} &gt;</h1>
      <div className="separator"></div>
      <div className="my-work-content">
        <div className="filters">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-button ${
                activeFilter === filter ? "active" : ""
              } ${rotate && activeFilter === filter ? "rotate" : ""}`}
              onClick={() => handleButtonClick(filter)}
            >
              <div className="text-layer default">{filter}</div>
              <div className="text-layer hover">{filter}</div>
            </button>
          ))}
        </div>
        <div className="projects">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="project"
              style={{
                backgroundImage: `url(${project.url})`,
              }}
            >
              <div className="project-description">
                <h3>{project.name}</h3>
                <p>Front: {project.front.join(", ")}</p>
                <p>Back: {project.back.join(", ")}</p>
              </div>
              <a
                href={project.http}
                target="_blank"
                rel="noreferrer"
                className="project-button"
              >
                {translate("myWorkBtn")}
              </a>
            </div>
          ))}
          {filteredProjects.length === 0 && (
            <p className="no-projects">{translate("myWorkNoProjects")}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default MyWork;
