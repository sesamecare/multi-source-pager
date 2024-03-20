import { DataSource } from '../src/types';

export interface LetterResult {
  cursor: string;
  type: 'letter';
  data: string;
}

export class MockLetterSource implements DataSource<LetterResult> {
  constructor(private results: LetterResult[]) {}

  async getResults(cursor: string | undefined, forward: boolean, limit: number) {
    const startIndex = this.results.findIndex(result => result.cursor > (cursor ?? ''));
    return {
      total: this.results.length,
      results: startIndex === -1 ? [] : this.results.slice(startIndex, startIndex + limit),
    };
  }

  sortKey(result: LetterResult): string {
    return result.cursor;
  }
}

export const mockLetters: LetterResult[] = [
  { cursor: '2023-01-01T00:00:00.000Z#A', data: 'A', type: 'letter' },
  { cursor: '2023-01-02T00:00:00.000Z#B', data: 'B', type: 'letter' },
  { cursor: '2023-01-03T00:00:00.000Z#C', data: 'C', type: 'letter' },
  { cursor: '2023-01-04T00:00:00.000Z#D', data: 'D', type: 'letter' },
  { cursor: '2023-01-05T00:00:00.000Z#E', data: 'E', type: 'letter' },
];

export const mockDoubleLetters: LetterResult[] = [
  { cursor: '2023-01-01T00:00:00.000Z#AA', data: 'AA', type: 'letter' },
  { cursor: '2023-01-01T00:00:00.000Z#AAA', data: 'AAA', type: 'letter' },
  { cursor: '2023-01-02T00:00:00.000Z#BB', data: 'BB', type: 'letter' },
  { cursor: '2023-01-02T00:00:00.000Z#BBB', data: 'BBB', type: 'letter' },
  { cursor: '2023-01-06T00:00:00.000Z#FF', data: 'FF', type: 'letter' },
  { cursor: '2023-01-07T00:00:00.000Z#GG', data: 'GG', type: 'letter' },
  { cursor: '2023-01-08T00:00:00.000Z#HH', data: 'HH', type: 'letter' },
];
