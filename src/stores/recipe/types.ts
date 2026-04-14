import { CustomItem, MinecraftIdentifier, Tag } from "@/data/models/types";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { generateUid } from "@/lib/utils";
import { RecipeSlot } from "@/recipes/slots";
import { VersionResourceData } from "@/stores/resources";

interface RecipeFields {
  id: string;
  nameMode: "auto" | "manual";
  name: string;
  recipeType: RecipeType;
  group: string;
  category: string;
  showNotification: boolean;
  smithing: {
    trimPattern: string;
  };
  crafting: {
    shapeless: boolean;
    keepWhitespace: boolean;
    twoByTwo: boolean;
  };
  cooking: {
    time: number;
    experience: number;
  };
  bedrock: {
    identifierMode: "auto" | "manual";
    identifierName: string;
    priority: number;
  };
}

export type RecipeSlotValue =
  | { kind: "item"; id: MinecraftIdentifier; count?: number }
  | { kind: "custom_item"; uid: string; count?: number }
  | { kind: "vanilla_tag"; id: MinecraftIdentifier }
  | { kind: "custom_tag"; uid: string };

export interface Recipe extends RecipeFields {
  slots: Partial<Record<RecipeSlot, RecipeSlotValue>>;
}

export interface RecipeState {
  recipes: Recipe[];
  selectedRecipeId: string;
}

export interface SlotDisplay {
  label: string;
  texture: string;
  previewValues?: string[];
  missing?: boolean;
}

export interface SlotContext {
  version: MinecraftVersion;
  resources?: VersionResourceData;
  customItemsByUid: Record<string, CustomItem>;
  tagsByUid: Record<string, Tag>;
  allTags: Tag[];
  vanillaTags: Record<string, string[]>;
}

export const recipeStateDefaults: Recipe = {
  id: "",
  nameMode: "auto",
  name: "",
  recipeType: RecipeType.Crafting,
  group: "",
  category: "",
  showNotification: true,
  smithing: {
    trimPattern: "",
  },
  slots: {},
  crafting: {
    shapeless: false,
    keepWhitespace: false,
    twoByTwo: false,
  },
  cooking: {
    time: 0,
    experience: 0,
  },
  bedrock: {
    identifierMode: "auto",
    identifierName: "",
    priority: 0,
  },
};

export const createDefaultRecipe = (): Recipe => ({
  ...recipeStateDefaults,
  id: generateUid("recipe"),
});
