import { getRawId } from "@/data/models/identifier/utilities";
import { SingleRecipeState } from "@/stores/recipe";

import { SLOTS } from "../types";
import {
  BedrockBrewingContainerBody,
  BedrockBrewingMixBody,
  BrewingInput,
} from "./recipes/types";

export const buildBedrock = (
  state: BrewingInput,
): BedrockBrewingContainerBody | BedrockBrewingMixBody => {
  return {
    input: state.input ? getRawId(state.input.id) : "",
    reagent: state.reagent ? getRawId(state.reagent.id) : "",
    output: state.output ? getRawId(state.output.id) : "",
  };
};

const extractInput = (state: SingleRecipeState): BrewingInput => ({
  recipeType: state.recipeType as BrewingInput["recipeType"],
  input: state.slots[SLOTS.brewing.input],
  reagent: state.slots[SLOTS.brewing.reagent],
  output: state.slots[SLOTS.brewing.result],
});

export const validateBrewing = (state: SingleRecipeState): string[] => {
  const input = extractInput(state);
  const errors: string[] = [];

  if (!input.input) {
    errors.push("Add an input item");
  } else if (input.input.type === "tag_item") {
    errors.push("Brewing recipes do not support tags as input");
  }

  if (!input.reagent) {
    errors.push("Add a reagent item");
  } else if (input.reagent.type === "tag_item") {
    errors.push("Brewing recipes do not support tags as reagent");
  }

  if (!input.output) {
    errors.push("Add an output item");
  } else if (input.output.type === "tag_item") {
    errors.push("Brewing recipes do not support tags as output");
  }

  return errors;
};

export { extractInput as extractBrewingInput };
