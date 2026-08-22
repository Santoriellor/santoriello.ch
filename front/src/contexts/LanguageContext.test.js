import { useContext } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageContext, LanguageProvider } from "./LanguageContext";

// A minimal consumer, so the context is tested through its public surface
// rather than through a page component.
function Probe() {
  const { language, changeLanguage, translate } = useContext(LanguageContext);
  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="about">{translate("aboutMe")}</span>
      <span data-testid="missing">{translate("noSuchKeyExists")}</span>
      <button onClick={() => changeLanguage("de")}>to german</button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>
  );

beforeEach(() => {
  localStorage.clear();
});

test("defaults to english when nothing is stored", () => {
  renderProbe();
  expect(screen.getByTestId("language")).toHaveTextContent("en");
  expect(screen.getByTestId("about")).toHaveTextContent("About Me");
});

test("reads the language stored by a previous visit", () => {
  localStorage.setItem("language", "fr");
  renderProbe();
  expect(screen.getByTestId("language")).toHaveTextContent("fr");
  expect(screen.getByTestId("about")).toHaveTextContent("A propos");
});

test("changing the language persists it", () => {
  renderProbe();
  fireEvent.click(screen.getByText("to german"));
  expect(screen.getByTestId("language")).toHaveTextContent("de");
  expect(screen.getByTestId("about")).toHaveTextContent("Über mich");
  expect(localStorage.getItem("language")).toBe("de");
});

test("translate returns the key itself when no translation exists", () => {
  renderProbe();
  expect(screen.getByTestId("missing")).toHaveTextContent("noSuchKeyExists");
});
