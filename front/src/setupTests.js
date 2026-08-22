// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// jsdom (react-scripts' default jest test environment) does not implement
// IntersectionObserver. Home, AboutMe, MyWork and Contact all construct one
// in a useEffect to drive scroll-reveal animations, so without this stub
// their effects throw a ReferenceError and any render(<App />) fails. The
// stub is a no-op: the reveal callback simply never fires in tests, which is
// fine since App.test.js only asserts that something rendered.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = IntersectionObserverStub;

// jsdom also does not implement window.matchMedia. ThemeToggle (rendered
// inside DropdownMenu, part of App) reads it synchronously in a useEffect
// to detect the OS color-scheme preference, so without this stub that
// effect throws too. Always reports "no preference" (matches: false).
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
