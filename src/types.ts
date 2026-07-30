/**
 * Data source types produced and consumed by individual data sources.
 */
export interface ResultWithCursor {
  cursor: string;
  type: string;
}

export interface DatasourceResults<T extends ResultWithCursor> {
  results: T[];
  // Are any more results possible? Typically check that you received the number of results you asked for.
  hasMore: boolean;
  // If total is available from ALL data sources, a total will
  // be returned from the paged set.
  total?: number;
  // There can be cases where you don't return results, but the cursor
  // has advanced anyhow. Once we run out of results, we will use this
  // cursor.
  cursor: string;
}

/**
 * Generate the next set of results. The number of results is up to you,
 * as the paging function will just consume one at a time.
 */
export interface DataSource<T extends ResultWithCursor> {
  getNextResults(cursor: string | undefined): Promise<DatasourceResults<T>>;
  sortKey(result: T): string;
}

export interface DataGeneratorOptions {
  // A source that reports hasMore while returning nothing makes no progress. Stop fetching
  // after this many consecutive empty pages rather than spinning on it forever. A source may
  // legitimately return empty pages while paging past filtered-out rows, so this needs room
  // to be larger than the longest run of empty pages you expect. Defaults to 10.
  maxConsecutiveEmptyPages?: number;
}

/**
 * Underneath, we use generators to fetch the next result. You can
 * use this class directly if you want, or we will translate to it
 * from DataSource automatically.
 */
export interface DataGenerator<T extends ResultWithCursor> {
  getGenerator(cursor: string | undefined, forward: boolean): AsyncGenerator<T, void, unknown>;
  sortKey(result: T): string;
  totalResults(): number | undefined;
}

/**
 * Types used in the return of the paging functions
 */
export type OptionalCursor<T extends ResultWithCursor> = Omit<T, 'cursor'> & Partial<Pick<T, 'cursor'>>;

export interface CollatedDatasource<T> {
  getNextResults(count: number): Promise<{ results: T[], total?: number }>;
}
