import { defineMcp } from "@lovable.dev/mcp-js";
import listScreensTool from "./tools/list-screens";
import getTrackerCatalogTool from "./tools/get-tracker-catalog";

export default defineMcp({
  name: "ascend-ui-replica",
  title: "Ascend UI Replica",
  version: "0.1.0",
  instructions:
    "Tools for the ASCEND productivity app. Use `list_screens` to discover the app's screens and routes, and `get_tracker_catalog` to read the demo goals, study, workout and analytics content shown in the UI.",
  tools: [listScreensTool, getTrackerCatalogTool],
});
