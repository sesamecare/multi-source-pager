import TinyQueue from 'tinyqueue';

import { getCursorArray, toCursor } from './cursor';
import { CollatedDatasource, DataGenerator, DataSource, ResultWithCursor } from './types';
import { ExtractResultType } from './internal-types';
import { queuedDataSource } from './queuedDataSource';

interface QueueEntry {
  result: ResultWithCursor;
  index: number;
  key: string;
}

type Source = DataGenerator<ResultWithCursor> | DataSource<ResultWithCursor>;

export async function multiSourcePager<Types extends Array<Source>>(
  options: {
    // Compare two results and determine which comes first
    comparator: (a: string, b: string) => number;
    // Fetch initial results after this cursor
    cursor?: string;
  },
  ...dataSources: Types
): Promise<CollatedDatasource<ExtractResultType<Types[number]>>> {
  const queueCompare = (a: QueueEntry, b: QueueEntry) => options.comparator(a.key, b.key) || a.index - b.index;

  const queue = new TinyQueue<QueueEntry>([], queueCompare);
  const cursors: string[] = getCursorArray(options.cursor);
  let total: number | undefined = 0;

  const asDataGenerator = dataSources.map((ds) => ('getGenerator' in ds) ? ds : queuedDataSource(ds));
  const generators = asDataGenerator.map((ds, index) => ds.getGenerator(cursors[index], true));

  await Promise.all(generators.map(async (generator, index) => {
    const item = await generator.next();
    if (total !== undefined) {
      const t = asDataGenerator[index].totalResults();
      if (t === undefined) {
        total = undefined;
      } else {
        total += t;
      }
    }
    if (!item.done) {
      queue.push({
        result: item.value,
        index,
        key: dataSources[index].sortKey(item.value),
      });
    }
  }));

  return {
    async getNextResults(count) {
      const results: ExtractResultType<Types[number]>[] = [];
      while (results.length < count && queue.length > 0) {
        const { result, index } = queue.pop() as QueueEntry;
        cursors[index] = result.cursor;
        results.push({
          ...result,
          cursor: toCursor(cursors),
        } as ExtractResultType<Types[number]>);

        // Fetch next item from the generator of the data source that the last item came from
        const nextResult = await generators[index].next();
        if (!nextResult.done) {
          queue.push({
            result: nextResult.value,
            index,
            key: dataSources[index].sortKey(nextResult.value),
          });
        }
      }

      return { results, total };
    },
  };
}
