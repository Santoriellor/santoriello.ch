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
    </LanguageProvider>,
  );
  expect(container.querySelector(".lang-menu")).toBeNull();

  fireEvent.click(container.querySelector(".lang-current"));
  expect(screen.getByText("English")).toBeInTheDocument();
  expect(screen.getByText("Français")).toBeInTheDocument();
  expect(screen.getByText("Deutsch")).toBeInTheDocument();
});

test("the trigger names the current language and announces the menu state", () => {
  const { container } = render(
    <LanguageProvider>
      <LanguageToggle />
    </LanguageProvider>,
  );
  const trigger = screen.getByRole("button", { name: "Language: English" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveAttribute("aria-haspopup", "true");

  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(container.querySelector(".flag svg")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});

test("choosing a language re-renders the page copy and persists the choice", () => {
  const { container } = render(
    <LanguageProvider>
      <div>
        <LanguageToggle />
        <AboutMe />
      </div>
    </LanguageProvider>,
  );

  expect(container.querySelector(".about-me-title").textContent).toBe(
    "< About >",
  );

  fireEvent.click(container.querySelector(".lang-current"));
  fireEvent.click(screen.getByText("Français"));

  expect(container.querySelector(".about-me-title").textContent).toBe(
    "< A propos >",
  );
  expect(localStorage.getItem("language")).toBe("fr");
});
