import type { CapacitorConfig } from "@capacitor/cli";

// Android/Capacitor packaging config for the existing Ascend web app.
// The web build output for this Vite project is `dist/client`.
// Run `bun run build:mobile` (or `npm run build:mobile`) before `npx cap sync`.
const config: CapacitorConfig = {
  appId: "com.ascend.app",
  appName: "Ascend",
  webDir: "dist/client",
  android: {
    allowMixedContent: false,
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
