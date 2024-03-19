import { describe, it, expect } from 'vitest';

import { MockLetterSource, mockDoubleLetters, mockLetters } from '../__tests__/LetterDataSource';

import { multiSourcePager } from './index';

// Comparator for sorting by cursor (ISO date)
const comparator = (a: string, b: string) => a.localeCompare(b);

describe('multiSourcePager', () => {
  it('should return the first page of results sorted by date', async () => {
    const dataSourceA = new MockLetterSource(mockLetters);
    const dataSourceB = new MockLetterSource(mockDoubleLetters);

    const p1 = await multiSourcePager({
      comparator,
      pageSize: 3,
    }, dataSourceA, dataSourceB);

    expect(p1.results.length).toBe(3);
    expect(p1.total).toBe(12);
    expect(p1.results).toMatchInlineSnapshot(`
      [
        {
          "cursor": "2023-01-01T00:00:00.000Z#A",
          "data": "A",
          "type": "letter",
        },
        {
          "cursor": "2023-01-01T00:00:00.000Z#AA",
          "data": "AA",
          "type": "letter",
        },
        {
          "cursor": "2023-01-01T00:00:00.000Z#AAA",
          "data": "AAA",
          "type": "letter",
        },
      ]
    `);
    expect(p1.cursor).toBe('WyIyMDIzLTAxLTAxVDAwOjAwOjAwLjAwMFojQSIsIjIwMjMtMDEtMDFUMDA6MDA6MDAuMDAwWiNBQUEiXQ==');

    const p2 = await multiSourcePager({
      comparator,
      pageSize: 3,
      cursor: p1.cursor,
    }, dataSourceA, dataSourceB);

    expect(p2.results.length).toBe(3);
    expect(p2.total).toBe(12);
    expect(p2.results).toMatchInlineSnapshot(`
      [
        {
          "cursor": "2023-01-02T00:00:00.000Z#B",
          "data": "B",
          "type": "letter",
        },
        {
          "cursor": "2023-01-02T00:00:00.000Z#BB",
          "data": "BB",
          "type": "letter",
        },
        {
          "cursor": "2023-01-02T00:00:00.000Z#BBB",
          "data": "BBB",
          "type": "letter",
        },
      ]
    `);

    const p3 = await multiSourcePager({
      comparator,
      pageSize: 5,
      cursor: p2.cursor,
    }, dataSourceA, dataSourceB);
    expect(p3.results).toMatchInlineSnapshot(`
      [
        {
          "cursor": "2023-01-03T00:00:00.000Z#C",
          "data": "C",
          "type": "letter",
        },
        {
          "cursor": "2023-01-04T00:00:00.000Z#D",
          "data": "D",
          "type": "letter",
        },
        {
          "cursor": "2023-01-05T00:00:00.000Z#E",
          "data": "E",
          "type": "letter",
        },
        {
          "cursor": "2023-01-06T00:00:00.000Z#FF",
          "data": "FF",
          "type": "letter",
        },
        {
          "cursor": "2023-01-07T00:00:00.000Z#GG",
          "data": "GG",
          "type": "letter",
        },
      ]
    `);

    const p4 = await multiSourcePager({
      comparator,
      pageSize: 5,
      cursor: p3.cursor,
    }, dataSourceA, dataSourceB);
    expect(p4.results).toMatchInlineSnapshot(`
      [
        {
          "cursor": "2023-01-08T00:00:00.000Z#HH",
          "data": "HH",
          "type": "letter",
        },
      ]
    `);
  });
});
