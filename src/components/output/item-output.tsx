import { useMemo, useRef, useState } from "react";

import {
  CircleAlertIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardCopyIcon,
  DownloadIcon,
} from "lucide-react";

import { Tooltip } from "@/components/tooltip/tooltip";
import { MinecraftVersion } from "@/data/types";
import { useCurrentRecipeName } from "@/hooks/use-current-recipe-name";
import { useSlotContext } from "@/hooks/use-slot-context";
import { trackRecipeExport } from "@/lib/analytics";
import { downloadRecipeJson } from "@/lib/download/recipe";
import { cn } from "@/lib/utils";
import { generate } from "@/recipes/generate";
import { toJavaRecipeFileName } from "@/recipes/naming";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

import { JsonOutput } from "./json-output";

import "./prism-github.css";

export const ItemOutput = () => {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const copyTimeoutRef = useRef<number | null>(null);

  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const recipeState = useRecipeStore(selectCurrentRecipe);
  const slotContext = useSlotContext();
  const naming = useCurrentRecipeName();
  let downloadTarget: string | undefined;

  if (minecraftVersion === MinecraftVersion.Bedrock) {
    downloadTarget = naming?.resolvedBedrockIdentifier;
  } else if (naming?.resolvedJavaName) {
    downloadTarget = toJavaRecipeFileName(naming.resolvedJavaName);
  }

  const generatedResult = useMemo(() => {
    if (!recipeState) {
      return {
        recipe: {},
      };
    }

    try {
      return {
        recipe: generate({
          state: recipeState,
          version: minecraftVersion,
          slotContext,
          options:
            minecraftVersion === MinecraftVersion.Bedrock && naming
              ? { bedrockIdentifier: naming.resolvedBedrockIdentifier }
              : undefined,
        }),
      };
    } catch (error) {
      return {
        recipe: {},
        error: error instanceof Error ? error.message : "Failed to generate recipe",
      };
    }
  }, [recipeState, minecraftVersion, naming, slotContext]);

  const handleCopy = async () => {
    if (copied) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(generatedResult.recipe, null, 2));
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      return;
    }
    setCopied(true);
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopied(false);
      copyTimeoutRef.current = null;
    }, 1000);
  };

  if (!recipeState) return null;

  let copyTooltip = "Copy JSON";
  if (generatedResult.error) {
    copyTooltip = "Copy unavailable";
  } else if (copied) {
    copyTooltip = "Copied";
  }

  return (
    <div className="bg-card rounded-lg border lg:flex lg:min-h-0 lg:flex-col">
      <div className="flex items-center justify-between px-4 py-2">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 text-sm font-medium transition-colors"
          onClick={() => setCollapsed((value) => !value)}
        >
          <ChevronDownIcon
            size={14}
            className={cn("transition-transform", collapsed && "-rotate-90")}
          />
          Output
        </button>

        <div className="flex items-center gap-1">
          <Tooltip content={copyTooltip} placement="top">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!!generatedResult.error}
              className="text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? (
                <CheckIcon size={14} className="text-primary" />
              ) : (
                <ClipboardCopyIcon size={14} />
              )}
              <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
            </button>
          </Tooltip>
          <button
            type="button"
            onClick={() => {
              if (downloadTarget) {
                const result = downloadRecipeJson({
                  recipe: recipeState,
                  version: minecraftVersion,
                  slotContext,
                  target: downloadTarget,
                });

                if (result.status === "success") {
                  trackRecipeExport({
                    export_kind: "single_json",
                    minecraft_version: minecraftVersion,
                    recipe_count: 1,
                  });
                }
              }
            }}
            disabled={!!generatedResult.error || !downloadTarget}
            className="border-border bg-accent/30 text-foreground hover:bg-accent inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            title="Download JSON"
          >
            <DownloadIcon size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="scrollbar-app border-t lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {generatedResult.error ? (
            <div className="border-destructive/40 bg-destructive/10 text-destructive m-3 flex items-start gap-2.5 rounded-md border px-3 py-3 text-sm">
              <CircleAlertIcon size={16} className="mt-0.5 shrink-0" />
              <span>{generatedResult.error}</span>
            </div>
          ) : (
            <JsonOutput json={generatedResult.recipe} />
          )}
        </div>
      )}
    </div>
  );
};
