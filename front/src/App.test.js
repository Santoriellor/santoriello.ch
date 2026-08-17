import { render } from '@testing-library/react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

// App's components (Home, AboutMe, MyWork, Contact, DropdownMenu) all read
// LanguageContext via useContext, and the context has no default value
// (createContext() with no argument), so a bare render(<App />) throws. The
// real entry point (src/index.js) wraps App in LanguageProvider; do the same
// here.
test('the app renders without crashing', () => {
  const { container } = render(
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
  expect(container).not.toBeEmptyDOMElement();
});
