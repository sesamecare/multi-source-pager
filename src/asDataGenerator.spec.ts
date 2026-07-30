import { describe, it, expect } from 'vitest';

import { asDataGenerator } from './asDataGenerator';
import { DataSource, DatasourceResults, ResultWithCursor } from './types';

interface Letter extends ResultWithCursor {
  data: string;
}

function letter(data: string, cursor: string): Letter {
  return { data, cursor, type: 'letter' };
}

async function drain(dataSource: DataSource<Letter>) {
  const results: Letter[] = [];
  for await (const result of asDataGenerator(dataSource).getGenerator(undefined, true)) {
    results.push(result);
  }
  return results;
}

describe('asDataGenerator', () => {
  it('stops fetching a source that reports hasMore but never returns results', async () => {
    // A source in this shape held a production pod at ~100rps against a downstream service
    // for six days. hasMore was computed from the raw fetch rather than from the filtered
    // page, so it stayed true while every page came back empty. The cursor changed each call
    // (it was derived from the current time), so it even looked like progress was happening.
    let fetches = 0;
    const stuck: DataSource<Letter> = {
      async getNextResults() {
        fetches += 1;
        return { results: [], hasMore: true, cursor: `cursor-${fetches}` };
      },
      sortKey: (result) => result.cursor,
    };

    expect(await drain(stuck)).toEqual([]);
    expect(fetches).toBe(10);
  });

  it('stops when a source hands back the cursor it was given', async () => {
    let fetches = 0;
    const notAdvancing: DataSource<Letter> = {
      async getNextResults() {
        fetches += 1;
        return { results: [letter('A', 'same')], hasMore: true, cursor: 'same' };
      },
      sortKey: (result) => result.cursor,
    };

    // One wasted re-request is enough to detect the source cannot advance.
    expect((await drain(notAdvancing)).map((r) => r.data)).toEqual(['A', 'A']);
    expect(fetches).toBe(2);
  });

  it('keeps paging when an empty page still advances the cursor', async () => {
    // DatasourceResults documents returning no results with an advanced cursor, so an empty
    // page that makes progress must not be mistaken for a stuck source.
    const pages: DatasourceResults<Letter>[] = [
      { results: [], hasMore: true, cursor: 'c1' },
      { results: [], hasMore: true, cursor: 'c2' },
      { results: [letter('Z', 'c3')], hasMore: false, cursor: 'c3' },
    ];
    let fetches = 0;
    const sparse: DataSource<Letter> = {
      async getNextResults() {
        const page = pages[fetches];
        fetches += 1;
        return page;
      },
      sortKey: (result) => result.cursor,
    };

    expect((await drain(sparse)).map((r) => r.data)).toEqual(['Z']);
    expect(fetches).toBe(3);
  });
});
