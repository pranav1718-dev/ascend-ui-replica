import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

const CATALOG = {
  goals: [
    { name: "Lose 5 kg", progress: 60, meta: "3 kg left" },
    { name: "Run 5K", progress: 40, meta: "2.1 km left" },
    { name: "Read 20 Books", progress: 70, meta: "6 books left" },
    { name: "Wake up at 6 AM", progress: 80, meta: "14 days left" },
  ],
  study: [
    { name: "Data Structures", progress: 65 },
    { name: "Operating Systems", progress: 40 },
    { name: "Database Systems", progress: 30 },
  ],
  workout: [
    { label: "Workouts", value: "24" },
    { label: "Calories", value: "3,450" },
    { label: "Minutes", value: "1,860" },
  ],
  analytics: [
    { label: "Workouts", value: "5", delta: "+2" },
    { label: "Study Hours", value: "12.5", delta: "+1.5" },
    { label: "Habits", value: "85%", delta: "+15%" },
  ],
} as const;

type Section = keyof typeof CATALOG;

export default defineTool({
  name: "get_tracker_catalog",
  title: "Get tracker catalog",
  description:
    "Read the demo tracker content shown in the ASCEND app: goals, study subjects, workout stats or the weekly analytics overview.",
  inputSchema: {
    section: z
      .enum(["goals", "study", "workout", "analytics"])
      .describe("Which tracker section to read."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ section }) => {
    const items = CATALOG[section as Section];
    if (!items) throw new ToolError(`Unknown section: ${section}`);
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { section, items },
    };
  },
});
