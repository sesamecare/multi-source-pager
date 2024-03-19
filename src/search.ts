import { decode, encode } from 'universal-base64';

import { DataSource, ResultWithCursor } from './types';

export function getCursorArray(encoded: string | undefined) {
  if (!encoded) {
    return [];
  }
  const decoded = decode(encoded);
  return JSON.parse(decoded);
}

export function toCursor(cursors: string[]) {
  return encode(JSON.stringify(cursors));
}

/**
 * Return a page of results from multiple data sources based on an
 * aggregate cursor and a comparison function to sort the results.
 */
export async function multiSourcePager<Types extends Array<DataSource<ResultWithCursor>>>(
  options: {
    // Compare two results and determine which comes first
    comparator: (a: string, b: string) => number;
    pageSize: number;
    // Fetch results after this cursor
    cursor?: string;
  },
  ...dataSources: Types
) {
  const cursors: string[] = getCursorArray(options.cursor);

  let sumTotal: number | undefined = 0;
  const fetchedResults = await Promise.all(
    dataSources.map((dataSource, index) => dataSource
      .getResults(cursors[index], options.pageSize)
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
  sorted.forEach(({ index }, i) => {
    cursors[index] = sorted[i].result.cursor;
  });
  return {
    results: sorted.map(({ result }) => result),
    cursor: toCursor(cursors),
    total: sumTotal,
  };
}
