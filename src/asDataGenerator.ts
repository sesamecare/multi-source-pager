import { DataGenerator, DataGeneratorOptions, DataSource, ResultWithCursor } from './types';

// A data source that reports hasMore while returning nothing makes no progress, and this loop
// would spin on it forever without ever yielding - starving the caller rather than failing. A
// source may legitimately return an empty page while paging past filtered-out rows, so allow a
// short run of them before concluding the source is stuck.
export const DEFAULT_MAX_CONSECUTIVE_EMPTY_PAGES = 10;

export function asDataGenerator<T extends ResultWithCursor>(
  dataSource: DataSource<T>,
  filter?: (result: T) => boolean,
  options: DataGeneratorOptions = {},
): DataGenerator<T> {
  const maxConsecutiveEmptyPages =
    options.maxConsecutiveEmptyPages ?? DEFAULT_MAX_CONSECUTIVE_EMPTY_PAGES;
  let total: number | undefined;

  return {
    async *getGenerator(cursor: string | undefined) {
      let currentCursor = cursor;
      let continueFetching = true;
      let consecutiveEmptyPages = 0;

      while (continueFetching) {
        const requestedCursor = currentCursor;
        const response = await dataSource.getNextResults(currentCursor);
        const results = response.results || [];
        total = response.total;
        continueFetching = response.hasMore;

        for (const result of results) {
          if (!filter || filter(result)) {
            yield result;
          }
          currentCursor = result.cursor; // Assuming the cursor for the next fetch is from the last item
        }
        // There is a nuance here - we COULD return this result-set cursor for the last
        // result in the yield above, and that would avoid fetching unused results next time.
        currentCursor = response.cursor;

        consecutiveEmptyPages = results.length === 0 ? consecutiveEmptyPages + 1 : 0;

        // Stop rather than re-request a page we cannot advance past. Either the source handed
        // back the very cursor we just gave it, or it has returned nothing often enough that
        // it is not going to.
        if (
          continueFetching &&
          (currentCursor === requestedCursor ||
            consecutiveEmptyPages >= maxConsecutiveEmptyPages)
        ) {
          continueFetching = false;
        }
      }
    },
    sortKey: dataSource.sortKey,
    totalResults() {
      return total;
    }
  };
}
