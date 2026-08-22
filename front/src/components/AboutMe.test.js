import { render } from "@testing-library/react";
import AboutMe from "./AboutMe";
import { LanguageProvider } from "../contexts/LanguageContext";

const renderAboutMe = () =>
  render(
    <LanguageProvider>
      <AboutMe />
    </LanguageProvider>
  );

beforeEach(() => {
  localStorage.clear();
});

test("all nine skills render, in order, with their levels", () => {
  const { container } = renderAboutMe();
  const names = [...container.querySelectorAll(".skill span")].map(
    (s) => s.textContent
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

  const levels = [...container.querySelectorAll(".progress-bar-fill")].map((d) =>
    d.style.getPropertyValue("--level")
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
    "/images/me.png"
  );
});

// Characterization, not endorsement: the alt text is the Create React App
// placeholder "Your Name". Task 8 replaces it and updates this test.
test("the portrait's alt text is still the placeholder", () => {
  const { container } = renderAboutMe();
  expect(container.querySelector("img")).toHaveAttribute("alt", "Your Name");
});

test("the army link points at the public STAT page", () => {
  const { container } = renderAboutMe();
  const link = container.querySelector(".description-links");
  expect(link).toHaveAttribute(
    "href",
    "https://www.defense.gouv.fr/terre/section-technique-larmee-terre-stat"
  );
});
