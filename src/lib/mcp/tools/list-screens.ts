import { defineTool } from "@lovable.dev/mcp-js";

const SCREENS = [
  { path: "/", name: "Splash", description: "Animated splash screen that advances to onboarding." },
  { path: "/onboarding", name: "Onboarding", description: "Intro artwork with Get Started and Sign In." },
  { path: "/login", name: "Login", description: "Email and password sign in." },
  { path: "/signup", name: "Sign Up", description: "Create an account." },
  { path: "/home", name: "Home Dashboard", description: "Daily progress ring, stats and today's plan." },
  { path: "/habits", name: "Habits", description: "Daily habit tracking." },
  { path: "/workout", name: "Workout", description: "Today's workout plan and training stats." },
  { path: "/study", name: "Study", description: "Study planner and subject progress." },
  { path: "/calendar", name: "Calendar", description: "Monthly calendar and events." },
  { path: "/analytics", name: "Analytics", description: "Weekly overview and progress chart." },
  { path: "/goals", name: "Goals", description: "Active goals with progress." },
  { path: "/water", name: "Water Tracker", description: "Daily hydration tracking." },
  { path: "/pomodoro", name: "Pomodoro", description: "Focus timer." },
  { path: "/profile", name: "Profile", description: "User profile summary." },
  { path: "/settings", name: "Settings", description: "App preferences." },
];

export default defineTool({
  name: "list_screens",
  title: "List app screens",
  description: "List every screen in the ASCEND app with its route path and purpose.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(SCREENS, null, 2) }],
    structuredContent: { screens: SCREENS },
  }),
});
