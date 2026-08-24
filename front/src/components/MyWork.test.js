import { render, screen, fireEvent } from "@testing-library/react";
import MyWork from "./MyWork";
import { LanguageProvider } from "../contexts/LanguageContext";
import { projects } from "../data/projects";

const renderMyWork = () =>
  render(
    <LanguageProvider>
      <MyWork />
    </LanguageProvider>,
  );

const cardNames = (container) =>
  [...container.querySelectorAll(".project-description h3")].map(
    (h) => h.textContent,
  );

beforeEach(() => {
  localStorage.clear();
});

test("five projects render by default, in order", () => {
  const { container } = renderMyWork();
  expect(cardNames(container)).toEqual([
    "La Ferme",
    "Workshop",
    "S.I.R",
    "Space Invader",
    "Pantry",
  ]);
});

test("the ten filter buttons are offered, in order", () => {
  const { container } = renderMyWork();
  const labels = [...container.querySelectorAll(".filter-button .default")].map(
    (d) => d.textContent,
  );
  expect(labels).toEqual([
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
  ]);
});

test("a filter button's accessible name is its label, once", () => {
  renderMyWork();
  expect(screen.getByRole("button", { name: "Angular" })).toBeInTheDocument();
});

test("filtering by Angular leaves the two Angular projects", () => {
  const { container } = renderMyWork();
  fireEvent.click(screen.getByRole("button", { name: "Angular" }));
  expect(cardNames(container)).toEqual(["Space Invader", "Pantry"]);
});

test("filtering by React leaves the two React projects", () => {
  const { container } = renderMyWork();
  fireEvent.click(screen.getByRole("button", { name: "React" }));
  expect(cardNames(container)).toEqual(["La Ferme", "Workshop"]);
});

test("filtering by MySQL matches on the backend list too", () => {
  const { container } = renderMyWork();
  fireEvent.click(screen.getByRole("button", { name: "MySQL" }));
  expect(cardNames(container)).toEqual(["Workshop", "S.I.R"]);
});

test("returning to All restores every project", () => {
  const { container } = renderMyWork();
  fireEvent.click(screen.getByRole("button", { name: "PHP" }));
  expect(cardNames(container)).toEqual(["S.I.R"]);
  fireEvent.click(screen.getByRole("button", { name: "All" }));
  expect(cardNames(container)).toHaveLength(5);
});

// All ten real filters match at least one project (see
// docs/decisions/0004-deferred-findings.md), so the empty-filter state is
// unreachable through the UI with real data. Force it by truncating the
// shared projects array in place for the duration of this test — the export
// binding is read-only but its contents are not — rather than adding a
// test-only code path to MyWork.js. Task 6 renamed the translation key
// myWorkNoProject -> myWorkNoProjects so this renders real copy instead of
// the raw key; nothing committed asserted that until this test.
test("the empty-filter message renders the translated copy, not the raw key", () => {
  const saved = [...projects];
  projects.length = 0;
  try {
    const { container } = renderMyWork();
    expect(container.querySelector(".no-projects").textContent).toBe(
      "No projects match this filter.",
    );
  } finally {
    projects.push(...saved);
  }
});

test("every project link opens in a new tab and severs the opener", () => {
  const { container } = renderMyWork();
  const links = [...container.querySelectorAll("a.project-button")];
  expect(links).toHaveLength(5);
  links.forEach((a) => {
    expect(a).toHaveAttribute("target", "_blank");
    expect(a.getAttribute("rel")).toMatch(/noreferrer|noopener/);
  });
  expect(links.map((a) => a.getAttribute("href"))).toEqual([
    "https://website.santoriello.ch",
    "https://workshop.santoriello.ch",
    "https://www.defense.gouv.fr/terre/section-technique-larmee-terre-stat/",
    "https://simulti.santoriello.ch/",
    "https://pantry.santoriello.ch/",
  ]);
});
