import { describe, it, expect } from 'vitest';

import { MockLetterSource, mockDoubleLetters, mockLetters } from '../__tests__/LetterDataSource';

import { multiSourcePager } from './multiSourcePager';
import { asDataGenerator } from './asDataGenerator';

// Comparator for sorting by cursor (ISO date)
const comparator = (a: string, b: string) => a.localeCompare(b);

describe('multi source pager', () => {
  it('should return the results in order', async () => {
    for (let i = 1; i <= 5; i += 1) {
      const dataSourceA = new MockLetterSource(mockLetters, i);
      const dataSourceB = new MockLetterSource(mockDoubleLetters, i);
      const pager = await multiSourcePager({
        comparator,
      }, dataSourceA, dataSourceB);

      const p1 = await pager.getNextResults(3);
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

      const p2 = await pager.getNextResults(3);
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

      const p3 = await pager.getNextResults(5);
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

      const p4 = await pager.getNextResults(5);
      expect(p4.results).toMatchInlineSnapshot(`
        [
          {
            "cursor": "WyIyMDIzLTAxLTA1VDAwOjAwOjAwLjAwMFojRSIsIjIwMjMtMDEtMDhUMDA6MDA6MDAuMDAwWiNISCJd",
            "data": "HH",
            "type": "letter",
          },
        ]
      `);
    }
  });

  it('should work with filters', async () => {
    const dataSourceA = new MockLetterSource(mockLetters, 3);
    const dataSourceB = new MockLetterSource(mockDoubleLetters, 5);
    const pager = await multiSourcePager({
      comparator,
    }, asDataGenerator(dataSourceA, (r) => !!(r.data.length % 2)), asDataGenerator(dataSourceB, (r) => !!(r.data.length % 2)));
    const p1 = await pager.getNextResults(10);
    expect(p1.results).toMatchInlineSnapshot(`
      [
        {
          "cursor": "WyIyMDIzLTAxLTAxVDAwOjAwOjAwLjAwMFojQSJd",
          "data": "A",
          "type": "letter",
        },
        {
          "cursor": "WyIyMDIzLTAxLTAxVDAwOjAwOjAwLjAwMFojQSIsIjIwMjMtMDEtMDFUMDA6MDA6MDAuMDAwWiNBQUEiXQ==",
          "data": "AAA",
          "type": "letter",
        },
        {
          "cursor": "WyIyMDIzLTAxLTAyVDAwOjAwOjAwLjAwMFojQiIsIjIwMjMtMDEtMDFUMDA6MDA6MDAuMDAwWiNBQUEiXQ==",
          "data": "B",
          "type": "letter",
        },
        {
          "cursor": "WyIyMDIzLTAxLTAyVDAwOjAwOjAwLjAwMFojQiIsIjIwMjMtMDEtMDJUMDA6MDA6MDAuMDAwWiNCQkIiXQ==",
          "data": "BBB",
          "type": "letter",
        },
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
      ]
    `);
  });
});
