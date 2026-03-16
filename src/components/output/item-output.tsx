import { useEffect, useRef, useState } from "react";

import { AlertCircleIcon, CheckIcon, ChevronDownIcon, ClipboardCopyIcon, DownloadIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { generate } from "@/data/generate";
import { downloadRecipeJson } from "@/lib/download/recipe";
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

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const generatedResult = (() => {
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
  })();

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
    <div className="rounded-lg border bg-card lg:min-h-0 lg:flex lg:flex-col">
      <div className="flex items-center justify-between px-4 py-2">
        <button
          type="button"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
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
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-accent/30 px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
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
            <div className="m-3 flex items-start gap-2.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-3 text-sm text-destructive">
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
