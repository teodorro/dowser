import { describe, expect, it } from 'vitest';
import { removeEmptyAscans } from './read-krot-txt-file';

describe('removeEmptyAscans', () => {
  it('removes ascans with zeros at the end', () => {
    const cells = [
      { n: 0, t: 0, a: 1 },
      { n: 1, t: 0, a: 3 },
      { n: 2, t: 4, a: 4 },
      { n: 3, t: 0, a: 0 },
      { n: 4, t: 5, a: 0 },
    ];

    const notZeroCells = removeEmptyAscans(cells);

    expect(notZeroCells.length).toEqual(3);
  });

  it('does nothing if no ascans with zeros', () => {
    const cells = [
      { n: 0, t: 0, a: 1 },
      { n: 1, t: 0, a: 3 },
      { n: 2, t: 4, a: 4 },
    ];

    const notZeroCells = removeEmptyAscans(cells);

    expect(notZeroCells.length).toEqual(3);
  });
});
