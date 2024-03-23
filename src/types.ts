/**
 * Data source types produced and consumed by individual data sources.
 */
export interface ResultWithCursor {
  cursor: string;
  type: string;
}

export interface DatasourceResults<T extends ResultWithCursor> {
  results: T[];
  // If total is available from ALL data sources, a total will
  // be returned from the paged set.
  total?: number;
}

export interface DataSource<T extends ResultWithCursor> {
  getResults(cursor: string | undefined, forward: boolean, limit: number): Promise<DatasourceResults<T>>;
  sortKey(result: T): string;
}

export interface DataGenerator<T extends ResultWithCursor> {
  getResults(cursor: string | undefined, forward: boolean): AsyncGenerator<T, void, unknown>;
  sortKey(result: T): string;
  totalResults(): number | undefined;
}

/**
 * Types used in the return of the paging functions
 */
export type OptionalCursor<T extends ResultWithCursor> = Omit<T, 'cursor'> & Partial<Pick<T, 'cursor'>>;

export interface PagedResults<T extends ResultWithCursor, ResultType = OptionalCursor<T>> {
  results: ResultType[];
  // If total is available from ALL data sources, a total will
  // be returned from the paged set.
  total?: number;
}

export interface CollatedDatasource<T> {
  getNextResults(count: number): Promise<{ results: T[], total?: number }>;
}
