import { useMemo, useRef } from "react";

import createFuzzySearch from "@nozbe/microfuzz";

export function useFuzzySearch<T>(
  items: T[],
  query: string,
  getText: (item: T) => (string | null)[],
): T[] {
  // ref so the search index isn't rebuilt when getText changes
  const getTextRef = useRef(getText);
  getTextRef.current = getText;

  const search = useMemo(
    () =>
      createFuzzySearch(items, { getText: (item) => getTextRef.current(item), strategy: "off" }),
    [items],
  );

  return useMemo(() => {
    if (!query.trim()) return items;
    return search(query).map(({ item }) => item);
  }, [items, query, search]);
}
