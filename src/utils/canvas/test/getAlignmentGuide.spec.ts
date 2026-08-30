// utils
import { getAlignmentGuide } from '../getAlignmentGuide';

describe('getAlignmentGuide', () => {
  it('should return no guide and leave the point untouched when there are no candidates', () => {
    // action
    const result = getAlignmentGuide({ x: 100, y: 100 }, [], 5);

    // result
    expect(result).toEqual({ horizontal: null, point: { x: 100, y: 100 }, vertical: null });
  });

  it('should return no guide when every candidate is outside the tolerance on both axes', () => {
    // action
    const result = getAlignmentGuide({ x: 100, y: 100 }, [{ x: 200, y: 200 }], 5);

    // result
    expect(result).toEqual({ horizontal: null, point: { x: 100, y: 100 }, vertical: null });
  });

  it('should snap the y onto a horizontally-aligned candidate within tolerance, leaving x untouched', () => {
    // action
    const result = getAlignmentGuide({ x: 100, y: 103 }, [{ x: 500, y: 100 }], 5);

    // result
    expect(result).toEqual({ horizontal: { x: 500, y: 100 }, point: { x: 100, y: 100 }, vertical: null });
  });

  it('should snap the x onto a vertically-aligned candidate within tolerance, leaving y untouched', () => {
    // action
    const result = getAlignmentGuide({ x: 103, y: 100 }, [{ x: 100, y: 500 }], 5);

    // result
    expect(result).toEqual({ horizontal: null, point: { x: 100, y: 100 }, vertical: { x: 100, y: 500 } });
  });

  it('should resolve both axes independently to two different candidates at once', () => {
    // mock — one candidate shares y (horizontal guide), a different candidate shares x (vertical guide)
    const rowCandidate = { x: 900, y: 100 };
    const columnCandidate = { x: 100, y: 900 };

    // action
    const result = getAlignmentGuide({ x: 102, y: 98 }, [rowCandidate, columnCandidate], 5);

    // result
    expect(result).toEqual({ horizontal: rowCandidate, point: { x: 100, y: 100 }, vertical: columnCandidate });
  });

  it('should pick the closest candidate on each axis when multiple are within tolerance', () => {
    // mock — two candidates both within tolerance on y; the nearer one should win
    const nearer = { x: 500, y: 101 };
    const farther = { x: 600, y: 104 };

    // action
    const result = getAlignmentGuide({ x: 100, y: 100 }, [farther, nearer], 5);

    // result
    expect(result.horizontal).toEqual(nearer);
  });

  it('should treat exactly-at-tolerance distance as a match (inclusive boundary)', () => {
    // action
    const result = getAlignmentGuide({ x: 100, y: 100 }, [{ x: 500, y: 105 }], 5);

    // result
    expect(result.horizontal).toEqual({ x: 500, y: 105 });
  });

  it('should treat just-past-tolerance distance as no match', () => {
    // action
    const result = getAlignmentGuide({ x: 100, y: 100 }, [{ x: 500, y: 105.1 }], 5);

    // result
    expect(result.horizontal).toBeNull();
  });

  it('should let a single candidate satisfy both axes at once when the point is diagonally within tolerance of it on both', () => {
    // action
    const result = getAlignmentGuide({ x: 103, y: 97 }, [{ x: 100, y: 100 }], 5);

    // result
    expect(result).toEqual({ horizontal: { x: 100, y: 100 }, point: { x: 100, y: 100 }, vertical: { x: 100, y: 100 } });
  });
});
