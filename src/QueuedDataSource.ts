import { DataGenerator, DataSource, ResultWithCursor } from './types';

export function queuedDataSource<T extends ResultWithCursor>(
  dataSource: DataSource<T>,
  fetchSize: number,
  filter?: (result: T) => boolean,
): DataGenerator<T> {
  let total: number | undefined;

  return {
    async *getResults(cursor: string | undefined, forward: boolean) {
      let currentCursor = cursor;
      let continueFetching = true;

      while (continueFetching) {
        const response = await dataSource.getResults(currentCursor, forward, fetchSize);
        total = response.total;
        if (response.results.length === 0) {
          continueFetching = false;
        } else {
          for (const result of response.results) {
            if (!filter || filter(result)) {
              yield result;
            }
            currentCursor = result.cursor; // Assuming the cursor for the next fetch is from the last item
          }
          // Continue fetching only if we received as many results as we asked for, implying there might be more.
          continueFetching = response.results.length === fetchSize;
        }
      }
    },
    sortKey: dataSource.sortKey,
    totalResults() {
      return total;
    }
  };
}
