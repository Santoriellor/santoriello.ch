import { render } from "@testing-library/react";
import AboutMe from "./AboutMe";
import { LanguageProvider } from "../contexts/LanguageContext";

const renderAboutMe = () =>
  render(
    <LanguageProvider>
      <AboutMe />
    </LanguageProvider>,
  );

beforeEach(() => {
  localStorage.clear();
});

test("all nine skills render, in order, with their levels", () => {
  const { container } = renderAboutMe();
  const names = [...container.querySelectorAll(".skill span")].map(
    (s) => s.textContent,
  );
  expect(names).toEqual([
    "HTML/CSS",
    "JavaScript/Typescript",
    "React/Svelte",
    "Angular",
    "Django/SpringBoot",
    "Python, Java",
    "PHP",
    "MySQL/PostgreSQL",
    "NGINX/Docker/GIT",
  ]);

  const levels = [...container.querySelectorAll(".progress-bar-fill")].map(
    (d) => d.style.getPropertyValue("--level"),
  );
  expect(levels).toEqual([
    "90%",
    "85%",
    "75%",
    "65%",
    "70%",
    "85%",
    "75%",
    "75%",
    "65%",
  ]);
});

test("the portrait points at the public image", () => {
  const { container } = renderAboutMe();
  expect(container.querySelector("img")).toHaveAttribute(
    "src",
    "/images/me.png",
  );
});

test("the portrait has real, translated alt text", () => {
  const { container } = renderAboutMe();
  expect(container.querySelector("img")).toHaveAttribute(
    "alt",
    "Portrait of Rémy Santoriello",
  );
});

// Asserts the whole list rather than the first match: the description now
// carries three links, and a first-match query would silently keep passing if
// one of them were reordered or dropped.
test("the description links point where they claim, in order", () => {
  const { container } = renderAboutMe();
  const hrefs = [...container.querySelectorAll(".description-links")].map((a) =>
    a.getAttribute("href"),
  );
  expect(hrefs).toEqual([
    "https://www.ibm.com/quantum/quantum-safe",
    "https://www.defense.gouv.fr/terre/section-technique-larmee-terre-stat",
    "#contact",
  ]);
});

test("the army link points at the public STAT page", () => {
  const { container } = renderAboutMe();
  const links = [...container.querySelectorAll(".description-links")];
  expect(links[1]).toHaveAttribute(
    "href",
    "https://www.defense.gouv.fr/terre/section-technique-larmee-terre-stat",
  );
});
