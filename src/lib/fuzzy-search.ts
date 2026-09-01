import createFuzzySearchModule, {
  type FuzzySearcher,
  type FuzzySearchOptions,
} from "@nozbe/microfuzz";

type CreateFuzzySearch = <T>(items: T[], options?: FuzzySearchOptions) => FuzzySearcher<T>;

// microfuzz ships CJS; depending on the bundler the default export may be nested
export const createFuzzySearch = (
  typeof createFuzzySearchModule === "function"
    ? createFuzzySearchModule
    : (createFuzzySearchModule as unknown as { default: CreateFuzzySearch }).default
) as CreateFuzzySearch;
