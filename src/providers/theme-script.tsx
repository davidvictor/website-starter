import { deriveShadows } from "@/themes/derive"
import {
  baseThemes,
  defaultThemeId,
  resolveTokens,
  tokensToCssVars,
} from "@/themes/registry"

/**
 * Inline script that reads the persisted theme + mode from localStorage
 * and applies CSS variables / data-theme / .dark before paint, avoiding
 * flash. Mirrors <ThemeProvider>'s first render.
 *
 * Each controller theme is pre-derived at build time for both modes,
 * inlined as a JSON map, and looked up by id in the inline script. We
 * don't re-run the derivation engine in the script (it would bloat the
 * payload); user-edited themes will momentarily render with the base
 * preset's tokens until React hydrates.
 */
export function ThemeScript() {
  const themeMap: Record<
    string,
    {
      accentUsage: string
      light: Record<string, string>
      dark: Record<string, string>
    }
  > = {}

  for (const theme of baseThemes) {
    themeMap[theme.id] = {
      accentUsage: theme.derivation.accentUsage,
      light: tokensToCssVars(
        resolveTokens(theme, "light"),
        deriveShadows("light", theme),
        theme
      ),
      dark: tokensToCssVars(
        resolveTokens(theme, "dark"),
        deriveShadows("dark", theme),
        theme
      ),
    }
  }

  const payload = JSON.stringify({ defaultThemeId, themes: themeMap })

  const script = `
(function () {
  try {
    var data = ${payload};
    var themeId = JSON.parse(localStorage.getItem("website-starter:theme-id") || "null") || data.defaultThemeId;
    var mode = JSON.parse(localStorage.getItem("website-starter:theme-mode") || "null") || "system";
    var resolved = mode;
    if (mode === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    var entry = data.themes[themeId] || data.themes[data.defaultThemeId];
    if (!entry) return;
    var html = document.documentElement;
    html.setAttribute("data-theme", themeId);
    html.setAttribute("data-accent-usage", entry.accentUsage || "primary-only");
    if (resolved === "dark") html.classList.add("dark");
    var vars = entry[resolved];
    for (var key in vars) {
      if (Object.prototype.hasOwnProperty.call(vars, key)) {
        html.style.setProperty(key, vars[key]);
      }
    }
  } catch (err) {}
})();
`

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: deliberate inline pre-paint script
      dangerouslySetInnerHTML={{ __html: script }}
    />
  )
}
