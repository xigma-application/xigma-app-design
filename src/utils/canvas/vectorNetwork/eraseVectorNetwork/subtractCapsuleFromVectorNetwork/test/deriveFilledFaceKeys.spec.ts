// utils
import { deriveFilledFaceKeys } from '../deriveFilledFaceKeys';

const ORIGINAL_POLYGON = {
  key: 'orig-a',
  polygon: [
    { x: 0, y: 0 },
    { x: 20, y: 0 },
    { x: 20, y: 20 },
    { x: 0, y: 20 },
  ],
};

describe('deriveFilledFaceKeys', () => {
  it("should keep a new face whose centroid falls inside the original polygon, paired with that polygon's own key", () => {
    // mock — a small face entirely inside the 20x20 original, made of real (non-capsule) segments
    const face = {
      key: 'ignored',
      pieceKeys: ['a[v:1|v:2]', 'b[v:2|v:1]'],
      points: [
        { x: 5, y: 5 },
        { x: 10, y: 5 },
        { x: 10, y: 10 },
        { x: 5, y: 10 },
      ],
    };

    // result
    expect(deriveFilledFaceKeys([face], [ORIGINAL_POLYGON], new Set())).toEqual([{ key: 'a[v:1|v:2],b[v:2|v:1]', originalKey: 'orig-a' }]);
  });

  it('should drop a new face whose centroid falls outside every original polygon', () => {
    // mock
    const face = {
      key: 'ignored',
      pieceKeys: ['a[v:1|v:2]'],
      points: [
        { x: 100, y: 100 },
        { x: 110, y: 100 },
        { x: 110, y: 110 },
      ],
    };

    // result
    expect(deriveFilledFaceKeys([face], [ORIGINAL_POLYGON], new Set())).toEqual([]);
  });

  it('should not produce a duplicate entry for a key claimed by more than one original polygon', () => {
    // mock — two overlapping original polygons both contain the same new face's centroid
    const face = {
      key: 'ignored',
      pieceKeys: ['a[v:1|v:2]'],
      points: [
        { x: 5, y: 5 },
        { x: 10, y: 5 },
        { x: 10, y: 10 },
        { x: 5, y: 10 },
      ],
    };
    const secondOriginal = { ...ORIGINAL_POLYGON, key: 'orig-b' };

    // result
    const result = deriveFilledFaceKeys([face], [ORIGINAL_POLYGON, secondOriginal], new Set());

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('a[v:1|v:2]');
  });

  it('should drop a face made entirely of capsule segments — a fully-interior stroke with no matching fill color to punch a real hole with', () => {
    // mock — otherwise a perfectly good, centred, real-area survivor face
    const face = {
      key: 'ignored',
      pieceKeys: ['cap1[v:1|v:2]', 'cap2[v:2|v:1]'],
      points: [
        { x: 5, y: 5 },
        { x: 10, y: 5 },
        { x: 10, y: 10 },
        { x: 5, y: 10 },
      ],
    };

    // result
    expect(deriveFilledFaceKeys([face], [ORIGINAL_POLYGON], new Set(['cap1', 'cap2']))).toEqual([]);
  });

  it('should keep a face that mixes capsule and original segments (a boundary-touching bite)', () => {
    // mock
    const face = {
      key: 'ignored',
      pieceKeys: ['orig1[v:1|v:2]', 'cap1[v:2|v:1]'],
      points: [
        { x: 5, y: 5 },
        { x: 10, y: 5 },
        { x: 10, y: 10 },
        { x: 5, y: 10 },
      ],
    };

    // result
    expect(deriveFilledFaceKeys([face], [ORIGINAL_POLYGON], new Set(['cap1']))).toEqual([
      { key: 'cap1[v:2|v:1],orig1[v:1|v:2]', originalKey: 'orig-a' },
    ]);
  });
});
