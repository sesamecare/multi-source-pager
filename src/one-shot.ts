import { getCursorArray, toCursor } from './cursor';
import { ExtractResultType } from './internal-types';
import { DataSource, OptionalCursor, PagedResults, ResultWithCursor } from './types';

/**
 * Return a page of results from multiple data sources based on an
 * aggregate cursor and a comparison function to sort the results.
 * Note that sort order should be handled by the data sources themselves,
 * and the one shot pager will only ever pass forward to your datasource function.
 */
export async function oneShotPager<Types extends Array<DataSource<ResultWithCursor>>>(
  options: {
    // Compare two results and determine which comes first
    comparator: (a: string, b: string) => number;
    pageSize: number;
    // Fetch results after this cursor
    cursor?: string;
    // True to only send cursor values for the first and last items
    edgeCursorsOnly?: boolean;
  },
  ...dataSources: Types
) {
  const cursors: string[] = getCursorArray(options.cursor);

  let sumTotal: number | undefined = 0;
  const fetchedResults = await Promise.all(
    dataSources.map((dataSource, index) => dataSource
      .getResults(cursors[index], true, options.pageSize)
      .then(({ results, total }) => {
        if (total !== undefined) {
          if (sumTotal !== undefined) {
            sumTotal += total;
          }
        } else {
          sumTotal = undefined;
        }
        return results.map((result) => ({
          result,
          index,
          key: dataSource.sortKey(result),
        }));
      })
    ),
  );

  const sorted = fetchedResults
    .flat()
    .sort((a, b) => options.comparator(a.key, b.key) || (a.index - b.index))
    .slice(0, options.pageSize);

  // Update the cursors with any results we used
  const results = sorted.map(({ index }, i) => {
    // The cursor for this item needs all the other cursors too.
    cursors[index] = sorted[i].result.cursor;
    return {
      ...sorted[i].result,
      cursor: toCursor(cursors),
    } as OptionalCursor<ExtractResultType<Types[number]>>;
  });

  return {
    results,
    total: sumTotal,
  } as PagedResults<ExtractResultType<Types[number]>>;
}
