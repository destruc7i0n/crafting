import type { ReactNode } from "react";

type CatalogResultsStateProps = {
  loading: boolean;
  hasCatalog: boolean;
  emptyMessage?: string;
};

export function CatalogResultsState({
  loading,
  hasCatalog,
  emptyMessage,
}: CatalogResultsStateProps) {
  if (loading) {
    return <p className="text-muted-foreground mb-3 text-sm">Loading recipes...</p>;
  }

  if (!hasCatalog) {
    return emptyMessage ? <CatalogEmptyState>{emptyMessage}</CatalogEmptyState> : null;
  }

  return emptyMessage ? <CatalogEmptyState>{emptyMessage}</CatalogEmptyState> : null;
}

function CatalogEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="border-border bg-card text-card-foreground rounded-lg border p-6 text-sm">
      {children}
    </div>
  );
}
