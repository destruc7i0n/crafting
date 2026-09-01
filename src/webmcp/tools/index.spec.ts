import { describe, expect, it } from "vitest";

import { isValidToolName } from "../model-context";
import { editorTools } from "./index";

const EXPECTED_TOOL_NAMES = [
  "get_editor_state",
  "search_items",
  "get_recipe_json",
  "create_recipe",
  "select_recipe",
  "delete_recipe",
  "update_recipe",
  "set_slots",
  "set_crafting_pattern",
  "clear_recipe_slots",
  "set_minecraft_version",
  "create_custom_item",
];

const READ_ONLY_TOOL_NAMES = new Set(["get_editor_state", "search_items", "get_recipe_json"]);

describe("editorTools", () => {
  it("exposes exactly 12 tools in the documented order", () => {
    expect(editorTools).toHaveLength(12);
    expect(editorTools.map((tool) => tool.name)).toEqual(EXPECTED_TOOL_NAMES);
  });

  it("uses unique, valid tool names", () => {
    const names = editorTools.map((tool) => tool.name);

    expect(new Set(names).size).toBe(names.length);

    for (const name of names) {
      expect(isValidToolName(name)).toBe(true);
    }
  });

  it("gives every tool a description and an object input schema", () => {
    const invalid = editorTools
      .filter((tool) => tool.description.trim().length === 0 || tool.inputSchema?.type !== "object")
      .map((tool) => tool.name);

    expect(invalid).toEqual([]);
  });

  it("marks only the read tools as read-only", () => {
    const readOnly = editorTools
      .filter((tool) => tool.annotations?.readOnlyHint === true)
      .map((tool) => tool.name);

    expect(readOnly).toEqual([...READ_ONLY_TOOL_NAMES]);
  });
});
