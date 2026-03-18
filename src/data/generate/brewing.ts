import { SingleRecipeState } from "@/stores/recipe";

import { SLOTS } from "../types";
import { FormatStrategy } from "./format/types";
import { formatIngredient } from "./ingredient";
import { BedrockBrewingContainerBody, BedrockBrewingMixBody, BrewingInput } from "./recipes/types";

export const buildBedrock = (
  state: BrewingInput,
  formatter: FormatStrategy,
): BedrockBrewingContainerBody | BedrockBrewingMixBody => {
  return {
    input: formatIngredient(state.input, formatter),
    reagent: formatIngredient(state.reagent, formatter),
    output: formatIngredient(state.result, formatter),
  };
};

export const extractBrewingInput = (state: SingleRecipeState): BrewingInput => ({
  recipeType: state.recipeType as BrewingInput["recipeType"],
  reagent: state.slots[SLOTS.brewing.reagent],
  input: state.slots[SLOTS.brewing.input],
  result: state.slots[SLOTS.brewing.result],
});

export const validateBrewing = (state: SingleRecipeState): string[] => {
  const input = extractBrewingInput(state);
  const errors: string[] = [];

  if (!input.input) {
    errors.push("Add an input item");
  }

  if (!input.reagent) {
    errors.push("Add a reagent item");
  }

  if (!input.result) {
    errors.push("Add a result item");
  }

  return errors;
};
