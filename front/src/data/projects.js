/**
 * The portfolio entries rendered by MyWork, newest last.
 *
 * `front` and `back` are matched literally against projectFilters below, so a
 * new technology must be spelled the same in both places or its filter button
 * will match nothing.
 */
export const projects = [
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
    /*
  {
    id: 6,
    name: "Pantry",
    front: ["Typescript", "Angular"],
    back: ["Java", "SpringBoot", "PostgreSQL"],
    url: "/images/projects/pantry.jpg",
    http: "https://pantry.santoriello.ch/",
  },
    */
  // Current work rather than a personal project, so `http` points at IBM's own
  // page - the same shape as S.I.R, which links to the French Army rather than
  // to a running app. Quarkus and Svelte are card labels only, not filter
  // buttons, exactly as HTML/CSS/JavaScript already are; the card stays
  // reachable through the Java and PostgreSQL filters.
  {
    id: 7,
    name: "IBM Quantum Safe",
    front: ["JavaScript", "Svelte"],
    back: ["Java", "Quarkus", "PostgreSQL"],
    url: "/images/projects/ibm-quantum-safe.jpg",
    http: "https://www.ibm.com/quantum/quantum-safe",
  },
];

/** "All" is special-cased in MyWork; the rest are matched against front/back. */
export const projectFilters = [
  "All",
  "React",
  "Angular",
  "Python",
  "Django",
  "Java",
  "SpringBoot",
  "PHP",
  "MySQL",
  "PostgreSQL",
];
