import { render, screen, fireEvent } from "@testing-library/react";
import MyWork from "./MyWork";
import { LanguageProvider } from "../contexts/LanguageContext";

const renderMyWork = () =>
  render(
    <LanguageProvider>
      <MyWork />
    </LanguageProvider>
  );

const cardNames = (container) =>
  [...container.querySelectorAll(".project-description h3")].map(
    (h) => h.textContent
  );

beforeEach(() => {
  localStorage.clear();
});

test("four projects render by default, in order", () => {
  const { container } = renderMyWork();
  expect(cardNames(container)).toEqual([
    "La Ferme",
    "Workshop",
    "S.I.R",
    "Space Invader",
  ]);
});

test("the ten filter buttons are offered, in order", () => {
  const { container } = renderMyWork();
  const labels = [...container.querySelectorAll(".filter-button .default")].map(
    (d) => d.textContent
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

// Each filter button renders its label twice, in a .default layer and a .hover
// layer, so its accessible name is the label doubled — with a space between
// the two copies, because the accessible-name algorithm inserts one between
// text drawn from separate block-level elements. That is a defect; Task 8
// hides the duplicate from assistive technology and updates this query.
test("a filter button's accessible name is its label, doubled", () => {
  renderMyWork();
  expect(
    screen.getByRole("button", { name: "Angular Angular" })
  ).toBeInTheDocument();
});

test("filtering by Angular leaves only Space Invader", () => {
  const { container } = renderMyWork();
  fireEvent.click(screen.getByRole("button", { name: "Angular Angular" }));
  expect(cardNames(container)).toEqual(["Space Invader"]);
});

test("filtering by React leaves the two React projects", () => {
  const { container } = renderMyWork();
  fireEvent.click(screen.getByRole("button", { name: "React React" }));
  expect(cardNames(container)).toEqual(["La Ferme", "Workshop"]);
});

test("filtering by MySQL matches on the backend list too", () => {
  const { container } = renderMyWork();
  fireEvent.click(screen.getByRole("button", { name: "MySQL MySQL" }));
  expect(cardNames(container)).toEqual(["Workshop", "S.I.R"]);
});

test("returning to All restores every project", () => {
  const { container } = renderMyWork();
  fireEvent.click(screen.getByRole("button", { name: "PHP PHP" }));
  expect(cardNames(container)).toEqual(["S.I.R"]);
  fireEvent.click(screen.getByRole("button", { name: "All All" }));
  expect(cardNames(container)).toHaveLength(4);
});

test("every project link opens in a new tab and severs the opener", () => {
  const { container } = renderMyWork();
  const links = [...container.querySelectorAll("a.project-button")];
  expect(links).toHaveLength(4);
  links.forEach((a) => {
    expect(a).toHaveAttribute("target", "_blank");
    expect(a.getAttribute("rel")).toMatch(/noreferrer|noopener/);
  });
  expect(links.map((a) => a.getAttribute("href"))).toEqual([
    "https://website.santoriello.ch",
    "https://workshop.santoriello.ch",
    "https://www.defense.gouv.fr/terre/section-technique-larmee-terre-stat/",
    "https://simulti.santoriello.ch/",
  ]);
});
