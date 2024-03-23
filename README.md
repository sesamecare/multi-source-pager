# @sesamecare-oss/multi-source-pager

Sometimes you need to join multiple remote data sources (such as external APIs) together into one list and support paging. @sesamecare-oss/multi-source-pager provides a class that manages these multiple streams and exposes a cursor-based paging interface to clients.

Currently, the module only supports "forward" paging, additional work is required to go backwards.

## Usage

See the tests for examples, but the core thing YOU need to do is implement a datasource. A datasource does two simple things, get results from a cursor, and return the sort key for a particular result.

```typescript
interface DataSource<T extends ResultWithCursor> {
  getResults(cursor: string | undefined, forward: boolean, limit: number): Promise<DatasourceResults<T>>;
  sortKey(result: T): string;
}
```

Underneath, we are using generators to fetch a single record at a time and avoid overfetching. So, if you're into that sort of thing, you can implement the DataGenerator instead:

```typescript
export interface DataGenerator<T extends ResultWithCursor> {
  getResults(cursor: string | undefined, forward: boolean): AsyncGenerator<T, void, unknown>;
  sortKey(result: T): string;
  totalResults(): number | undefined;
}
```

Now, to invoke the pager, you pass some options:
* a comparator function which will be passed the sortKey of two results and return standard comparison result values
* a cursor for the starting point of the results
* edgeCursorsOnly when you only want cursor values for the first and last item (this can save wire bytes)

And then just a list of data sources to use for the fetch.

You can convert a DataSource to a DataGenerator using the asDataGenerator function, which also allows you to specify a filter to be applied after the results are fetched.

**THERE ARE BUGS** - not because I know what they are but because this is hard and has not been battle tested nearly enough.
