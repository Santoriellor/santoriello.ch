import { render, screen, fireEvent } from "@testing-library/react";
import ThemeToggle from "./ThemeToggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

// setupTests.js stubs matchMedia to always report matches: false, i.e. the OS
// expresses no dark-mode preference, so a fresh visitor lands in light mode.
test("a fresh visitor gets the light theme, and it is written down", () => {
  render(<ThemeToggle />);
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  expect(localStorage.getItem("theme")).toBe("light");
  expect(screen.getByRole("switch")).not.toBeChecked();
});

test("a stored dark preference is restored", () => {
  localStorage.setItem("theme", "dark");
  render(<ThemeToggle />);
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  expect(screen.getByRole("switch")).toBeChecked();
});

test("clicking the switch flips the theme and persists it", () => {
  render(<ThemeToggle />);
  fireEvent.click(screen.getByRole("switch"));
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  expect(localStorage.getItem("theme")).toBe("dark");

  fireEvent.click(screen.getByRole("switch"));
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  expect(localStorage.getItem("theme")).toBe("light");
});

test("the switch has an accessible name", () => {
  render(<ThemeToggle />);
  expect(screen.getByRole("switch")).toHaveAccessibleName("dark mode toggle");
});
