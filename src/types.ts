export interface ResultWithCursor {
  cursor: string;
  type: string;
}

interface DatasourceResults<T extends ResultWithCursor> {
  results: T[];
  // If total is available from ALL data sources, a total will
  // be returned from the paged set.
  total?: number;
}

export interface DataSource<T extends ResultWithCursor> {
  getResults(cursor: string | undefined, limit: number): Promise<DatasourceResults<T>>;
  sortKey(result: T): string;
}
