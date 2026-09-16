// @lovable.dev/vite-tanstack-config already includes the required plugins.
// Do NOT add duplicate plugins manually.

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// MOBILE=1 is used when building the Android/WebView version.
const isMobile = process.env["MOBILE"] === "1";

export default defineConfig({
  nitro: isMobile ? false : undefined,
  tanstackStart: isMobile
    ? {
        spa: {
          enabled: true,
        },
      }
    : {
        server: {
          entry: "server",
        },
      },
});
