import { useMemo, useRef, useState } from "react";

import {
  AlertCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardCopyIcon,
  DownloadIcon,
} from "lucide-react";

import { generate } from "@/data/generate";
import { downloadRecipeJson } from "@/lib/download/recipe";
import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

import { JsonOutput } from "./json-output";

import "@jongwooo/prism-theme-github/themes/prism-github-default-auto.min.css";

export const ItemOutput = () => {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const recipeState = useRecipeStore(selectCurrentRecipe);

  const generatedResult = useMemo(() => {
    try {
      return {
        recipe: generate(recipeState, minecraftVersion),
      };
    } catch (error) {
      return {
        recipe: {},
        error: error instanceof Error ? error.message : "Failed to generate recipe",
      };
    }
  }, [recipeState, minecraftVersion]);

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

  return (
    <div className="bg-card rounded-lg border lg:flex lg:min-h-0 lg:flex-col">
      <div className="flex items-center justify-between px-4 py-2">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm font-medium transition-colors"
          onClick={() => setCollapsed((value) => !value)}
        >
          <ChevronDownIcon
            size={14}
            className={cn("transition-transform", collapsed && "-rotate-90")}
          />
          Output
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!!generatedResult.error}
            className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md p-1.5 transition-colors disabled:pointer-events-none disabled:opacity-40"
            title="Copy JSON"
          >
            {copied ? (
              <CheckIcon size={14} className="text-primary" />
            ) : (
              <ClipboardCopyIcon size={14} />
            )}
            <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            type="button"
            onClick={() => downloadRecipeJson(recipeState, minecraftVersion)}
            disabled={!!generatedResult.error}
            className="border-border bg-accent/30 text-foreground hover:bg-accent inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-40"
            title="Download JSON"
          >
            <DownloadIcon size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="border-t lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {generatedResult.error ? (
            <div className="border-destructive/40 bg-destructive/10 text-destructive m-3 flex items-start gap-2.5 rounded-md border px-3 py-3 text-sm">
              <AlertCircleIcon size={16} className="mt-0.5 shrink-0" />
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
