import { describe, expect, it } from 'vitest';
import { subtractMedian } from './subtract-median';

describe('subtractMedian', () => {
  it('should subtract the average of each column from each element', () => {
    const data = [
      [1, 2, 3],
      [1, 5, 6],
      [7, 8, 9],
    ];
    const expected = [
      [0, -3, -3],
      [0, 0, 0],
      [6, 3, 3],
    ];
    const result = subtractMedian(data);

    expect(result).toEqual(expected);
  });
});
