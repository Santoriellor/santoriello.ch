import { render, screen } from "@testing-library/react";
import Contact from "./Contact";
import { LanguageProvider } from "../contexts/LanguageContext";

const renderContact = () =>
  render(
    <LanguageProvider>
      <Contact />
    </LanguageProvider>
  );

beforeEach(() => {
  localStorage.clear();
});

// Where visitor data goes is the single most important fact about this
// component, so it is pinned. The access_key's value is deliberately NOT
// asserted: it is a public endpoint identifier, it may be rotated in the
// Web3Forms dashboard at any time, and a test that pins it would turn a routine
// rotation into a blocked deploy.
test("the form posts to the Web3Forms relay", () => {
  const { container } = renderContact();
  const form = container.querySelector("form.contact-form");
  expect(form).toHaveAttribute("method", "POST");
  expect(form).toHaveAttribute("action", "https://api.web3forms.com/submit");
});

test("the form carries an access key", () => {
  const { container } = renderContact();
  const key = container.querySelector('input[name="access_key"]');
  expect(key).toHaveAttribute("type", "hidden");
  expect(key.value).not.toBe("");
});

// Selected by input type rather than by "everything that is not hidden",
// because Task 5 adds a display:none checkbox to this form and a
// :not([type=hidden]) selector would pick it up.
test("name, email and message are all required", () => {
  const { container } = renderContact();
  const fields = [
    ...container.querySelectorAll(
      "input[type=text], input[type=email], textarea"
    ),
  ].map((f) => [f.tagName, f.getAttribute("name"), f.hasAttribute("required")]);
  expect(fields).toEqual([
    ["INPUT", "name", true],
    ["INPUT", "email", true],
    ["TEXTAREA", "message", true],
  ]);
});

test("the email field uses the email input type", () => {
  const { container } = renderContact();
  expect(container.querySelector('input[name="email"]')).toHaveAttribute(
    "type",
    "email"
  );
});

test("the submit button carries the translated label", () => {
  renderContact();
  expect(screen.getByRole("button")).toHaveTextContent("Submit");
});

test("the footer renders inside the contact section", () => {
  const { container } = renderContact();
  expect(container.querySelector("#contact #footer")).not.toBeNull();
});

// Security fix, not characterization (Spec D8): this asserts the corrected
// behaviour. The contact endpoint is public and unauthenticated by design, so
// the honeypot is the only spam defence that lives in this repository.
test("the form carries the Web3Forms honeypot field", () => {
  const { container } = renderContact();
  const honeypot = container.querySelector('input[name="botcheck"]');
  expect(honeypot).not.toBeNull();
  expect(honeypot).toHaveAttribute("type", "checkbox");
  expect(honeypot).toHaveStyle({ display: "none" });
});

// display:none removes an element from the accessibility tree, not just the
// visual layout, so a screen reader user never lands on it either — this is
// asserted via queryByRole rather than trusting the CSS declaration alone.
// tabIndex="-1" keeps it out of keyboard tab order too, and it is deliberately
// not `required`, or a real (non-bot) submission would be blocked.
test("the honeypot is invisible to assistive technology, out of tab order, and not required", () => {
  const { container } = renderContact();
  const honeypot = container.querySelector('input[name="botcheck"]');
  expect(honeypot).not.toHaveAttribute("required");
  expect(honeypot).toHaveAttribute("tabIndex", "-1");
  expect(screen.queryByRole("checkbox")).toBeNull();
});
