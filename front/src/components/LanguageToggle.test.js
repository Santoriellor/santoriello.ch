import { render, screen, fireEvent } from "@testing-library/react";
import LanguageToggle from "./LanguageToggle";
import AboutMe from "./AboutMe";
import { LanguageProvider } from "../contexts/LanguageContext";

beforeEach(() => {
  localStorage.clear();
});

test("the menu is closed until the trigger is clicked", () => {
  const { container } = render(
    <LanguageProvider>
      <LanguageToggle />
    </LanguageProvider>
  );
  expect(container.querySelector(".lang-menu")).toBeNull();

  fireEvent.click(container.querySelector(".lang-current"));
  expect(screen.getByText("English")).toBeInTheDocument();
  expect(screen.getByText("Français")).toBeInTheDocument();
  expect(screen.getByText("Deutsch")).toBeInTheDocument();
});

// Characterization, not endorsement: the trigger's only content is a flag SVG
// and a "▾" glyph, so its accessible name is "▾". Task 8 gives it a real name
// and updates this assertion.
test("the trigger's accessible name is the chevron glyph", () => {
  const { container } = render(
    <LanguageProvider>
      <LanguageToggle />
    </LanguageProvider>
  );
  expect(container.querySelector(".lang-current").textContent).toBe("▾");
});

test("choosing a language re-renders the page copy and persists the choice", () => {
  const { container } = render(
    <LanguageProvider>
      <div>
        <LanguageToggle />
        <AboutMe />
      </div>
    </LanguageProvider>
  );

  expect(container.querySelector(".about-me-title").textContent).toBe(
    "< About >"
  );

  fireEvent.click(container.querySelector(".lang-current"));
  fireEvent.click(screen.getByText("Français"));

  expect(container.querySelector(".about-me-title").textContent).toBe(
    "< A propos >"
  );
  expect(localStorage.getItem("language")).toBe("fr");
});
