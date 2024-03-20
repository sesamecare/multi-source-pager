import { describe, it, expect } from 'vitest';

import { MockLetterSource, mockDoubleLetters, mockLetters } from '../__tests__/LetterDataSource';

import { oneShotPager } from './index';

// Comparator for sorting by cursor (ISO date)
const comparator = (a: string, b: string) => a.localeCompare(b);

describe('stateful pager', () => {
  it('should return the first page of results sorted by date', async () => {
    const dataSourceA = new MockLetterSource(mockLetters);
    const dataSourceB = new MockLetterSource(mockDoubleLetters);

    const p1 = await oneShotPager({
      comparator,
      pageSize: 3,
    }, dataSourceA, dataSourceB);

    expect(p1.results.length).toBe(3);
    expect(p1.total).toBe(12);
    expect(p1.results).toMatchInlineSnapshot(`
      [
        {
          "cursor": "WyIyMDIzLTAxLTAxVDAwOjAwOjAwLjAwMFojQSJd",
          "data": "A",
          "type": "letter",
        },
        {
          "cursor": "WyIyMDIzLTAxLTAxVDAwOjAwOjAwLjAwMFojQSIsIjIwMjMtMDEtMDFUMDA6MDA6MDAuMDAwWiNBQSJd",
          "data": "AA",
          "type": "letter",
        },
        {
          "cursor": "WyIyMDIzLTAxLTAxVDAwOjAwOjAwLjAwMFojQSIsIjIwMjMtMDEtMDFUMDA6MDA6MDAuMDAwWiNBQUEiXQ==",
          "data": "AAA",
          "type": "letter",
        },
      ]
    `);

    const p2 = await oneShotPager({
      comparator,
      pageSize: 3,
      cursor: p1.results[p1.results.length - 1].cursor,
    }, dataSourceA, dataSourceB);

    expect(p2.results.length).toBe(3);
    expect(p2.total).toBe(12);
    expect(p2.results).toMatchInlineSnapshot(`
      [
        {
          "cursor": "WyIyMDIzLTAxLTAyVDAwOjAwOjAwLjAwMFojQiIsIjIwMjMtMDEtMDFUMDA6MDA6MDAuMDAwWiNBQUEiXQ==",
          "data": "B",
          "type": "letter",
        },
        {
          "cursor": "WyIyMDIzLTAxLTAyVDAwOjAwOjAwLjAwMFojQiIsIjIwMjMtMDEtMDJUMDA6MDA6MDAuMDAwWiNCQiJd",
          "data": "BB",
          "type": "letter",
        },
        {
          "cursor": "WyIyMDIzLTAxLTAyVDAwOjAwOjAwLjAwMFojQiIsIjIwMjMtMDEtMDJUMDA6MDA6MDAuMDAwWiNCQkIiXQ==",
          "data": "BBB",
          "type": "letter",
        },
      ]
    `);

    const p3 = await oneShotPager({
      comparator,
      pageSize: 5,
      cursor: p2.results[p2.results.length - 1].cursor,
    }, dataSourceA, dataSourceB);
    expect(p3.results).toMatchInlineSnapshot(`
      [
        {
          "cursor": "WyIyMDIzLTAxLTAzVDAwOjAwOjAwLjAwMFojQyIsIjIwMjMtMDEtMDJUMDA6MDA6MDAuMDAwWiNCQkIiXQ==",
          "data": "C",
          "type": "letter",
        },
        {
          "cursor": "WyIyMDIzLTAxLTA0VDAwOjAwOjAwLjAwMFojRCIsIjIwMjMtMDEtMDJUMDA6MDA6MDAuMDAwWiNCQkIiXQ==",
          "data": "D",
          "type": "letter",
        },
        {
          "cursor": "WyIyMDIzLTAxLTA1VDAwOjAwOjAwLjAwMFojRSIsIjIwMjMtMDEtMDJUMDA6MDA6MDAuMDAwWiNCQkIiXQ==",
          "data": "E",
          "type": "letter",
        },
        {
          "cursor": "WyIyMDIzLTAxLTA1VDAwOjAwOjAwLjAwMFojRSIsIjIwMjMtMDEtMDZUMDA6MDA6MDAuMDAwWiNGRiJd",
          "data": "FF",
          "type": "letter",
        },
        {
          "cursor": "WyIyMDIzLTAxLTA1VDAwOjAwOjAwLjAwMFojRSIsIjIwMjMtMDEtMDdUMDA6MDA6MDAuMDAwWiNHRyJd",
          "data": "GG",
          "type": "letter",
        },
      ]
    `);

    const p4 = await oneShotPager({
      comparator,
      pageSize: 5,
      cursor: p3.results[p3.results.length - 1].cursor,
    }, dataSourceA, dataSourceB);
    expect(p4.results).toMatchInlineSnapshot(`
      [
        {
          "cursor": "WyIyMDIzLTAxLTA1VDAwOjAwOjAwLjAwMFojRSIsIjIwMjMtMDEtMDhUMDA6MDA6MDAuMDAwWiNISCJd",
          "data": "HH",
          "type": "letter",
        },
      ]
    `);
  });
});
