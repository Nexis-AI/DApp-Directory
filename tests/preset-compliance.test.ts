import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

const readText = (relativePath: string) =>
  readFile(resolve(process.cwd(), relativePath), "utf8");

describe("shadcn a1D0dv72 compliance", () => {
  test("uses the exact preset menu configuration", async () => {
    const [appConfig, uiConfig] = await Promise.all([
      readText("apps/web/components.json"),
      readText("packages/ui/components.json"),
    ]);

    expect(JSON.parse(appConfig)).toMatchObject({
      style: "radix-mira",
      menuColor: "default",
      menuAccent: "subtle",
      rtl: true,
    });

    expect(JSON.parse(uiConfig)).toMatchObject({
      style: "radix-mira",
      menuColor: "default",
      menuAccent: "subtle",
      rtl: true,
    });
  });

  test("keeps the preset token baseline and theme defaults", async () => {
    const [globalsCss, themeProvider] = await Promise.all([
      readText("packages/ui/src/styles/globals.css"),
      readText("apps/web/components/theme-provider.tsx"),
    ]);

    expect(globalsCss).toContain("--radius: 0.625rem;");
    expect(globalsCss).not.toContain("color-scheme: dark;");
    expect(themeProvider).toContain('defaultTheme="system"');
    expect(themeProvider).toContain("enableSystem");
    expect(themeProvider).not.toContain("enableSystem={false}");
  });
});
