// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
//import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

// MOBILE=1 builds a client-side SPA shell (dist/client/_shell.html) that the
// Android WebView can boot for any route. The normal web build is untouched.
const isMobile = process.env["MOBILE"] === "1";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(isMobile ? { spa: { enabled: true } } : {}),
  },
  // vite: {
  //   plugins: [mcpPlugin()],
  // },
});

