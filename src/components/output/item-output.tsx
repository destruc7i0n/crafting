import { useEffect, useRef, useState } from "react";

import { ChevronDownIcon, ClipboardCopyIcon, DownloadIcon } from "lucide-react";

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

  const handleDownloadJson = () => {
    downloadRecipeJson(recipeState, minecraftVersion);
  };

  const handleCopy = async () => {
    if (copied) return;

    await navigator.clipboard.writeText(JSON.stringify(generatedResult.recipe, null, 2));
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
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between px-4 py-2">
        <button
          type="button"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setCollapsed((v) => !v)}
        >
          <ChevronDownIcon
            size={14}
            className={`transition-transform ${collapsed ? "-rotate-90" : ""}`}
          />
          Output
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Copy JSON"
          >
            <ClipboardCopyIcon size={14} />
            <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadJson}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Download JSON"
          >
            <DownloadIcon size={14} />
            <span className="sr-only">Download</span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="border-t">
          <JsonOutput json={generatedResult.recipe} />

          {generatedResult.error && (
            <div className="px-3 pb-3 text-sm text-destructive">
              Generation error: {generatedResult.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
