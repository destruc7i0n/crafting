import { generate } from "@/data/generate";
import { MinecraftVersion } from "@/data/types";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

import { JsonOutput } from "./json-output";

import "@jongwooo/prism-theme-github/themes/prism-github-default-light.min.css";

export const Output = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const recipeState = useRecipeStore(selectCurrentRecipe);
  const setMinecraftVersion = useSettingsStore(
    (state) => state.setMinecraftVersion,
  );

  const result = generate(recipeState, minecraftVersion);

  return (
    <div>
      <select
        onChange={(e) =>
          setMinecraftVersion(e.target.value as MinecraftVersion)
        }
        value={minecraftVersion}
      >
        {Object.values(MinecraftVersion).map((version) => (
          <option key={version} value={version}>
            {version}
          </option>
        ))}
      </select>

      <div className="gap-4 rounded-lg border p-2 shadow">
        <h2>Output</h2>
        <JsonOutput json={JSON.stringify(result, null, 2)} />
      </div>
    </div>
  );
};
