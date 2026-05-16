import { DownloadIcon } from "lucide-react";

import { useUIStore } from "@/stores/ui";

type PreviewExportOptionsProps = {
  canUseQuickExportShortcut: boolean;
  isExporting: boolean;
  onDownloadPreview: () => void;
};

export function PreviewExportOptions({
  canUseQuickExportShortcut,
  isExporting,
  onDownloadPreview,
}: PreviewExportOptionsProps) {
  const previewExportOptions = useUIStore((state) => state.previewExportOptions);
  const setPreviewExportOptions = useUIStore((state) => state.setPreviewExportOptions);

  return (
    <div className="flex flex-col gap-2" onClick={(event) => event.stopPropagation()}>
      <div className="text-muted-foreground px-1 text-xs font-medium">Preview Image Options</div>

      <label className="text-foreground hover:bg-accent flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1 text-sm transition-colors select-none">
        <input
          type="checkbox"
          className="accent-primary"
          checked={previewExportOptions.hideSingleItemCount}
          onChange={(event) =>
            setPreviewExportOptions({ hideSingleItemCount: event.target.checked })
          }
        />
        Hide output count of 1
      </label>

      <div className="border-border border-t" />

      <button
        type="button"
        className="hover:bg-accent active:bg-accent/80 flex w-full cursor-pointer items-center gap-2 rounded-sm px-1 py-1 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onDownloadPreview}
        disabled={isExporting}
      >
        <DownloadIcon size={13} className="text-muted-foreground shrink-0" />
        <span>Download PNG</span>
        {canUseQuickExportShortcut && (
          <kbd className="border-border bg-muted text-muted-foreground ml-auto rounded border px-1 py-0.5 font-sans text-[11px] font-medium">
            Shift+click
          </kbd>
        )}
      </button>
    </div>
  );
}
