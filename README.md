# multi-source-pager

Sometimes you need to join multiple remote data sources (such as external APIs) together into one list and support paging. multi-source-pager provides a class that manages these multiple streams and exposes a cursor-based paging interface to clients.

Currently, the module only supports "forward" paging, additional work is required to go backwards.

## Usage

There are three pagers here - a one-shot pager that will just return the next page based on the config, a stateful pager that will just return the next page and keep state to reduce unnecessary fetches beyond what the one-shot can do, and priority queue pager which probable should replace the other two. See the tests for examples, but the core thing YOU need to do is implement a datasource. A datasource does two simple things, get results from a cursor, and return the sort key for a particular result.

```typescript
interface DataSource<T extends ResultWithCursor> {
  getResults(cursor: string | undefined, forward: boolean, limit: number): Promise<DatasourceResults<T>>;
  sortKey(result: T): string;
}
```

Now, to invoke the pager, you pass some options:
* a comparator function which will be passed the sortKey of two results and return standard comparison result values
* a cursor for the starting point of the results
* edgeCursorsOnly when you only want cursor values for the first and last item (this can save wire bytes)
* for the one-shot, a page size
* for the stateful, a minimum page size to fetch, to avoid low-number item fetches

And then just a list of data sources to use for the fetch.

You can convert a DataSource to a DataGenerator using the queuedDataSource function, which also allows you to specify a filter to be applied after the results are fetched.

**THERE ARE BUGS** - not because I know what they are but because this is hard and has not been battle tested nearly enough.
