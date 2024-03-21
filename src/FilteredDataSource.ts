import { DataSource, ResultWithCursor } from './index';

// For some data sources, local filtering is all that is possible, but it can be helpful to treat it
// like a paged data source. SO, we will filter results after fetching them and then "top up" the datasource
// with the next page of results if necessary. Suboptimal - to be clear.
export function withFilter<T extends ResultWithCursor>(datasource: DataSource<T>, filter: (result: T) => boolean): DataSource<T> {
  return {
    async getResults(cursor: string | undefined, forward: boolean, limit: number) {
      const results: T[] = [];
      do {
        // TODO we maybe should optimize the fetch size more
        const nextResults = await datasource.getResults(results[results.length - 1]?.cursor || cursor, forward, limit);
        results.push(...nextResults.results.filter(filter));
        if (nextResults.results.length < limit) {
          // Didn't get the required number of elements, must be the end
          break;
        }
      } while (results.length < limit);
      // Can't give a total count
      return { results: results.slice(0, limit) };
    },
    sortKey: datasource.sortKey,
  };
}
