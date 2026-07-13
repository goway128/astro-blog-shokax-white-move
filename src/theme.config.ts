// cannot use path alias here because unocss can not resolve it
import { defineConfig } from "./toolkit/themeConfig";

export default defineConfig({
  siteName: "白の小站",
  brand: {
    title: "白の小站",
    subtitle: "伤心桥下春波绿，曾是惊鸿照影来。",
    logo: "🍥",
  },
  sidebar: {
    author: "white",
    description: "喵喵喵",
    social: {
      github: {
        url: "https://github.com/goway128",
        icon: "i-ri-github-fill",
      },
      email: {
        url: "mailto:1314520@life-white.uk",
        icon: "i-ri-mail-line",
      },
    },
  },
});
