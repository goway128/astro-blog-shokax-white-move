import { createInstance } from "i18next";
import themeConfig from "@/theme.config";
import { DEFAULT_LOCALE, resolveLocale, type ResolvedLocale } from "@/toolkit/i18n/resolveLocale";

// Import translation files
import zhCN from "./locales/zh-CN.json";
import zhTW from "./locales/zh-TW.json";
import ja from "./locales/ja.json";
import en from "./locales/en.json";

// Type for supported locales
export type Locale = ResolvedLocale;

// Resources type
const resources = {
  "zh-CN": { translation: zhCN },
  "zh-TW": { translation: zhTW },
  ja: { translation: ja },
  en: { translation: en },
} as const;

// Get current locale from theme config
export const currentLocale = resolveLocale(themeConfig.locale);

const i18next = createInstance();
await i18next.init({
  lng: currentLocale,
  fallbackLng: DEFAULT_LOCALE,
  resources,
  interpolation: {
    escapeValue: false,
  },
});

/**
 * Initialize i18n with the locale from theme config
 */
export async function initI18n(_locale: Locale = currentLocale) {
  return i18next;
}

/**
 * Get translation function for the configured locale
 */
export function getT(locale: Locale = currentLocale) {
  return i18next.getFixedT(locale);
}

/**
 * Helper to get locale from theme config
 */
export function getLocaleFromConfig(config: typeof themeConfig): Locale {
  return resolveLocale(config.locale);
}

/**
 * Pre-configured translation function using theme config locale
 * Import this directly in your components for convenience:
 *
 * import { t } from "@/i18n";
 *
 * <h1>{t("nav.home")}</h1>
 */
export const t = getT(currentLocale);

export { i18next };
