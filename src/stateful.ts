import { getCursorArray, toCursor } from './cursor';
import { ExtractResultType } from './internal-types';
import { DataSource, ResultWithCursor } from './types';

export interface CollatedDatasource<T> {
  getNextResults(count: number): Promise<{ results: T[], total?: number }>;
}

interface WorkingResult {
  result: ResultWithCursor;
  index: number;
  key: string;
}

/**
 * Return an object capable of providing paged results by lazily
 * pulling from a set of datasources (typically APIs). This source
 * is forward-only and therefore it's your job to handle sorting
 * in the datasources, and to be able to go 'back' to a previous page
 * by just storing the results. We should fix this someday.
 */
export function statefulPager<Types extends Array<DataSource<ResultWithCursor>>>(
  options: {
    // Compare two results and determine which comes first
    comparator: (a: string, b: string) => number;
    // Fetch initial results after this cursor
    cursor?: string;
    // Never fetch less than this many items
    minPageSize?: number;
  },
  ...dataSources: Types
): CollatedDatasource<ExtractResultType<Types[number]>> {
  const results: WorkingResult[][] = [];
  const cursors: string[] = getCursorArray(options.cursor);
  const totals: (number | undefined)[] = [];
  const isCompleted: boolean[] = [];

  return {
    async getNextResults(pageSize: number) {
      // Fill all datasources to have pageSize elements, OR be completed
      if (isCompleted.length === 0 || !isCompleted.every((completed) => completed)) {
        await Promise.all(dataSources.map(async (dataSource, index) => {
          if (isCompleted[index] || results[index]?.length >= pageSize) {
            return;
          }
          const needed = pageSize - (results[index]?.length || 0);
          const lastCursor = results[index] ? results[index][results[index].length - 1]?.result.cursor : undefined;
          const newResults = await dataSource.getResults(lastCursor || cursors[index], true, options.minPageSize ? Math.max(options.minPageSize, needed) : needed);
          if (newResults.results.length < needed) {
            isCompleted[index] = true;
          }
          totals[index] = newResults.total;
          results[index] = results[index] || [];
          results[index].push(...newResults.results.map((result) => ({ result, index, key: dataSource.sortKey(result) })));
        }));
      }
      // Not the most efficient way to do this, but while we understand this thing, easier to read.
      const all = results.flat().sort((a, b) => options.comparator(a.key, b.key) || (a.index - b.index)).slice(0, pageSize);
      if (all.length !== pageSize && !isCompleted.every((completed) => completed)) {
        throw new Error('Did not receive a full page of results but not all results are complete');
      }
      // Update the cursors with any results we used
      const finalResults = all.map((r) => {
        const sourceResults = results[r.index];
        if (sourceResults[0] !== r) {
          throw new Error('Results are not in the expected order');
        }
        cursors[r.index] = sourceResults[0].result.cursor;
        sourceResults.shift();
        return {
          ...r.result,
          cursor: toCursor(cursors),
        } as ExtractResultType<Types[number]>;
      });
      if (totals.every((total) => total !== undefined) && totals.length > 0) {
        return {
          results: finalResults,
          total: (totals as number[]).reduce((a: number, b: number) => a + b, 0),
        };
      }
      return {
        results: finalResults,
      };
    },
  }
}