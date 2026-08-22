import { render, screen } from "@testing-library/react";
import App from "./App";
import { LanguageProvider } from "./contexts/LanguageContext";

// App's components all read LanguageContext via useContext, and the context has
// no default value (createContext() with no argument), so a bare render(<App />)
// throws. The real entry point (src/index.js) wraps App in LanguageProvider; do
// the same here.
//
// This is the only test file that mounts the whole tree. CodeRain runs a 300 ms
// setInterval and a requestAnimationFrame loop while mounted, so every other
// test file renders a single component in isolation.
const renderApp = () =>
  render(
    <LanguageProvider>
      <App />
    </LanguageProvider>,
  );

beforeEach(() => {
  localStorage.clear();
});

test("the app renders without crashing", () => {
  const { container } = renderApp();
  expect(container).not.toBeEmptyDOMElement();
});

test("the four sections are on the page, in order, with the ids the nav links to", () => {
  const { container } = renderApp();
  const ids = [...container.querySelectorAll("section")].map((s) => s.id);
  expect(ids).toEqual(["home", "about-me", "my-work", "contact"]);
});

test("the footer is rendered inside the contact section", () => {
  const { container } = renderApp();
  const contact = container.querySelector("#contact");
  expect(contact.querySelector("#footer")).not.toBeNull();
});

test("there is exactly one navigation landmark", () => {
  renderApp();
  expect(screen.getByRole("navigation")).toBeInTheDocument();
});

// Task 8 added the main landmark. The four h1 elements are deliberately left
// alone: they carry no explicit font-size, so demoting them would shrink them.
// See docs/decisions/0004-deferred-findings.md.
test("the page has one main landmark wrapping the four sections", () => {
  const { container } = renderApp();
  const main = container.querySelector("main");
  expect(main).not.toBeNull();
  expect(
    [...main.querySelectorAll(":scope > section")].map((s) => s.id),
  ).toEqual(["home", "about-me", "my-work", "contact"]);
  expect(container.querySelectorAll("h1")).toHaveLength(4);
});

test("the html element carries the selected language", () => {
  localStorage.setItem("language", "de");
  renderApp();
  expect(document.documentElement.lang).toBe("de");
});
