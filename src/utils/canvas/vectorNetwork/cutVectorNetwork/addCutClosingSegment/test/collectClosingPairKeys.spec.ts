// utils
import { collectClosingPairKeys } from '../collectClosingPairKeys';

describe('collectClosingPairKeys', () => {
  it("should pair a face's own open ends by line position, matching a fragmented crossing.segmentId against the face's base id", () => {
    // before — "left" was already severed once, so this cut sees it as "left#1"
    const result = collectClosingPairKeys(
      ['left[x|y],right[x|y]'],
      [
        { lineT: 0, point: { x: 0, y: 0 }, segmentId: 'left#1', t: 0.5 },
        { lineT: 1, point: { x: 0, y: 100 }, segmentId: 'right#0', t: 0.5 },
      ],
      ['a', 'd'],
      { a: 0, d: 1 },
    );

    // result
    expect(result).toEqual(new Set(['a|d']));
  });

  it('should not pair open ends belonging to two unrelated faces together', () => {
    // before
    const result = collectClosingPairKeys(
      ['segA[x|y]', 'segB[x|y]'],
      [
        { lineT: 0, point: { x: 0, y: 0 }, segmentId: 'segA', t: 0.5 },
        { lineT: 1, point: { x: 100, y: 0 }, segmentId: 'segA', t: 0.5 },
        { lineT: 2, point: { x: 100, y: 100 }, segmentId: 'segB', t: 0.5 },
        { lineT: 3, point: { x: 0, y: 100 }, segmentId: 'segB', t: 0.5 },
      ],
      ['a', 'b', 'c', 'd'],
      { a: 0, b: 1, c: 2, d: 3 },
    );

    // result
    expect(result).toEqual(new Set(['a|b', 'c|d']));
  });

  it('should leave a face with an odd count of open ends unpaired', () => {
    // before
    const result = collectClosingPairKeys(
      ['segA[x|y],segC[x|y],segD[x|y]'],
      [
        { lineT: 0, point: { x: 0, y: 0 }, segmentId: 'segA', t: 0.5 },
        { lineT: 1, point: { x: 200, y: 0 }, segmentId: 'segC', t: 0.5 },
        { lineT: 2, point: { x: 100, y: 100 }, segmentId: 'segD', t: 0.5 },
      ],
      ['a', 'c', 'd'],
      { a: 0, c: 1, d: 2 },
    );

    // result
    expect(result).toEqual(new Set());
  });

  it('should return an empty set when there are no original filled faces', () => {
    // result
    expect(collectClosingPairKeys([], [], [], {})).toEqual(new Set());
  });
});
