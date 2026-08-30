// utils
import { getGroupAlignmentGuide } from '../getGroupAlignmentGuide';

describe('getGroupAlignmentGuide', () => {
  it('should return no guide and a zero correction when there are no candidates', () => {
    // action
    const result = getGroupAlignmentGuide([{ x: 100, y: 100 }], [], 5);

    // result
    expect(result).toEqual({ deltaCorrection: { x: 0, y: 0 }, guide: null });
  });

  it('should return no guide and a zero correction when every candidate is outside tolerance for every dragged point', () => {
    // action
    const result = getGroupAlignmentGuide([{ x: 100, y: 100 }], [{ x: 900, y: 900 }], 5);

    // result
    expect(result).toEqual({ deltaCorrection: { x: 0, y: 0 }, guide: null });
  });

  it('should resolve a vertical match for a single dragged point, correcting only x', () => {
    // mock — 3 world units off the candidate's x, within tolerance
    const draggedPoint = { x: 103, y: 400 };
    const candidate = { x: 100, y: 900 };

    // action
    const result = getGroupAlignmentGuide([draggedPoint], [candidate], 5);

    // result
    expect(result.deltaCorrection).toEqual({ x: -3, y: 0 });
    expect(result.guide).toEqual({
      horizontal: null,
      vertical: { anchor: { x: 100, y: 400 }, match: candidate },
    });
  });

  it('should resolve a horizontal match for a single dragged point, correcting only y', () => {
    // mock — 3 world units off the candidate's y, within tolerance
    const draggedPoint = { x: 400, y: 103 };
    const candidate = { x: 900, y: 100 };

    // action
    const result = getGroupAlignmentGuide([draggedPoint], [candidate], 5);

    // result
    expect(result.deltaCorrection).toEqual({ x: 0, y: -3 });
    expect(result.guide).toEqual({
      horizontal: { anchor: { x: 400, y: 100 }, match: candidate },
      vertical: null,
    });
  });

  it('should anchor the vertical and horizontal guides on two different dragged vertices, each corrected by the OTHER axis’s delta too, since the whole group moves as one', () => {
    // mock — two vertices dragged together: A is close to a vertical candidate, B (a different
    // vertex) is close to a horizontal candidate — both within tolerance, neither exact
    const vertexA = { x: 298, y: 400 };
    const vertexB = { x: 500, y: 598 };
    const columnMatch = { x: 300, y: 900 };
    const rowMatch = { x: 900, y: 600 };

    // action
    const result = getGroupAlignmentGuide([vertexA, vertexB], [columnMatch, rowMatch], 5);

    // result — deltaCorrection.x (=2) pulls A onto columnMatch.x, deltaCorrection.y (=2) pulls B onto
    // rowMatch.y; both corrections apply to the WHOLE group, so each anchor reflects both
    expect(result.deltaCorrection).toEqual({ x: 2, y: 2 });
    expect(result.guide).toEqual({
      horizontal: { anchor: { x: 502, y: 600 }, match: rowMatch },
      vertical: { anchor: { x: 300, y: 402 }, match: columnMatch },
    });
  });

  it('should pick the closest match across all dragged points on a given axis, not just the first one checked', () => {
    // mock — both A and B are within tolerance of a vertical candidate at x=100, but B is closer
    const vertexA = { x: 104, y: 200 };
    const vertexB = { x: 101, y: 300 };
    const candidate = { x: 100, y: 900 };

    // action
    const result = getGroupAlignmentGuide([vertexA, vertexB], [candidate], 5);

    // result — B (distance 1) wins over A (distance 4)
    expect(result.guide?.vertical).toEqual({ anchor: { x: 100, y: 300 }, match: candidate });
  });
});
