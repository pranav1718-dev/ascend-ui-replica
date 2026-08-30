// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

// `MOBILE=1 bun run build:mobile` produces a client-only (SPA) bundle that
// Capacitor loads inside the Android WebView. The normal web build is untouched.
const isMobile = process.env["MOBILE"] === "1";

export default defineConfig({
  nitro: isMobile ? false : undefined,
  tanstackStart: isMobile
    ? {
        // Client-only shell: every route is served by index.html in the WebView.
        spa: { enabled: true },
        prerender: { enabled: true },
        pages: [{ path: "/", prerender: { enabled: true } }],
      }
    : {
        // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
        // nitro/vite builds from this
        server: { entry: "server" },
      },
  vite: {
    plugins: [mcpPlugin()],
  },
});
