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
  /* Uncomment once pantry.santoriello.ch is deployed - until then `http` would
     be a dead link on a live page. The image is a placeholder; replace it with
     a real screenshot at the same time.
  {
    id: 6,
    name: "Pantry",
    front: ["Typescript", "Angular"],
    back: ["Java", "SpringBoot", "PostgreSQL"],
    url: "/images/projects/pantry.jpg",
    http: "https://pantry.santoriello.ch/",
  }, */
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
