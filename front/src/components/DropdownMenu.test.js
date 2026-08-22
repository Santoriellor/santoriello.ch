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

// Characterization, not endorsement: the burger is a <div> with an onClick
// today, so it is not focusable and exposes no role. Task 8 makes it a <button>
// and updates this test.
test("the burger is a div, not a button", () => {
  const { container } = renderMenu();
  expect(container.querySelector(".toggle-burger").tagName).toBe("DIV");
  expect(screen.queryAllByRole("button")).toHaveLength(1); // only the language trigger
});
