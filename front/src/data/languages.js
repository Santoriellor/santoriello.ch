/**
 * The languages offered by LanguageToggle. The keys are the codes stored in
 * localStorage and used to index src/assets/translations.js, so adding one here
 * without adding a dictionary there makes translate() fall through to the key.
 */
export const LANGUAGES = {
  en: { label: "EN", name: "English" },
  fr: { label: "FR", name: "Français" },
  de: { label: "DE", name: "Deutsch" },
};
