import { DataGenerator, DataSource, ResultWithCursor } from './types';

export function asDataGenerator<T extends ResultWithCursor>(
  dataSource: DataSource<T>,
  filter?: (result: T) => boolean,
): DataGenerator<T> {
  let total: number | undefined;

  return {
    async *getGenerator(cursor: string | undefined) {
      if (cursor === '') {
        // The special empty string cursor indicates we should not fetch any more.
        return;
      }

      let currentCursor = cursor;
      let continueFetching = true;

      while (continueFetching) {
        const response = await dataSource.getNextResults(currentCursor);
        total = response.total;
        continueFetching = response.hasMore;

        for (const result of response.results || []) {
          if (!filter || filter(result)) {
            yield result;
          }
          currentCursor = result.cursor; // Assuming the cursor for the next fetch is from the last item
        }
        // There is a nuance here - we COULD return this result-set cursor for the last
        // result in the yield above, and that would avoid fetching unused results next time.
        currentCursor = response.cursor;
      }
    },
    sortKey: dataSource.sortKey,
    totalResults() {
      return total;
    }
  };
}
