import { render, screen, within, fireEvent } from "@testing-library/react";
import DropdownMenu from "./DropdownMenu";
import { LanguageProvider } from "../contexts/LanguageContext";

const renderMenu = () =>
  render(
    <LanguageProvider>
      <DropdownMenu />
    </LanguageProvider>
  );

beforeEach(() => {
  localStorage.clear();
});

test("the navigation links to the four section ids", () => {
  renderMenu();
  const nav = screen.getByRole("navigation");
  const hrefs = within(nav)
    .getAllByRole("link")
    .map((a) => a.getAttribute("href"));
  expect(hrefs).toEqual(["#home", "#about-me", "#my-work", "#contact"]);
});

// The IntersectionObserver stub in setupTests.js never fires, so isVisible stays
// false and the navbar keeps its "hidden" class for the whole test. That is the
// component's initial state, and pinning it catches an accidental inversion of
// the condition.
test("the navbar starts hidden", () => {
  const { container } = renderMenu();
  expect(container.querySelector(".navbar").className).toBe("navbar hidden");
});

test("the burger opens and closes the link list", () => {
  const { container } = renderMenu();
  const burger = container.querySelector(".toggle-burger");
  expect(container.querySelector(".dropdown-links").className).toBe(
    "dropdown-links"
  );

  fireEvent.click(burger);
  expect(container.querySelector(".dropdown-links").className).toBe(
    "dropdown-links open"
  );

  fireEvent.click(burger);
  expect(container.querySelector(".dropdown-links").className).toBe(
    "dropdown-links"
  );
});

test("clicking a link closes the open menu", () => {
  const { container } = renderMenu();
  fireEvent.click(container.querySelector(".toggle-burger"));
  fireEvent.click(screen.getByRole("link", { name: "Home" }));
  expect(container.querySelector(".dropdown-links").className).toBe(
    "dropdown-links"
  );
});

test("the burger is a real button that announces whether the menu is open", () => {
  const { container } = renderMenu();
  const burger = screen.getByRole("button", { name: "Menu" });
  expect(burger.tagName).toBe("BUTTON");
  expect(burger).toHaveAttribute("type", "button");
  expect(burger).toHaveAttribute("aria-expanded", "false");
  expect(burger).toHaveAttribute("aria-controls", "dropdown-links");
  expect(container.querySelector("#dropdown-links")).not.toBeNull();

  fireEvent.click(burger);
  expect(burger).toHaveAttribute("aria-expanded", "true");
});
