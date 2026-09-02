// utils
import { getEdges } from '../../getDistanceGuides/getEdges';
import { getHorizontalEqualSpacingGuide } from '../getHorizontalEqualSpacingGuide';

const ACTIVE = getEdges({ height: 100, width: 100, x: 100, y: 0 });

describe('getHorizontalEqualSpacingGuide', () => {
  it('should return a guide for each gap when the left and right gaps are equal', () => {
    // before — 20px gap on both sides
    const left = getEdges({ height: 100, width: 80, x: 0, y: 0 });
    const right = getEdges({ height: 100, width: 50, x: 220, y: 0 });

    // action
    const guide = getHorizontalEqualSpacingGuide(ACTIVE, { left, right });

    // result
    expect(guide.lines).toEqual([
      { dashed: false, x1: 80, x2: 100, y1: 50, y2: 50 },
      { dashed: false, x1: 200, x2: 220, y1: 50, y2: 50 },
    ]);
    expect(guide.labels).toEqual([
      { anchor: { x: 90, y: 50 }, offsetDirection: { x: 0, y: 1 }, text: '20' },
      { anchor: { x: 210, y: 50 }, offsetDirection: { x: 0, y: 1 }, text: '20' },
    ]);
  });

  it('should return no guide when the gaps are not equal', () => {
    // before — 20px on the left, 40px on the right
    const left = getEdges({ height: 100, width: 80, x: 0, y: 0 });
    const right = getEdges({ height: 100, width: 50, x: 240, y: 0 });

    // action
    const guide = getHorizontalEqualSpacingGuide(ACTIVE, { left, right });

    // result
    expect(guide).toEqual({ labels: [], lines: [] });
  });

  it('should return no guide when only one side has a neighbor', () => {
    // before
    const left = getEdges({ height: 100, width: 80, x: 0, y: 0 });

    // action
    const guide = getHorizontalEqualSpacingGuide(ACTIVE, { left, right: null });

    // result
    expect(guide).toEqual({ labels: [], lines: [] });
  });

  it('should return no guide when a "gap" is actually flush contact (zero distance)', () => {
    // before — left neighbor touches the active shape's left edge exactly
    const left = getEdges({ height: 100, width: 100, x: 0, y: 0 });
    const right = getEdges({ height: 100, width: 50, x: 200, y: 0 });

    // action
    const guide = getHorizontalEqualSpacingGuide(ACTIVE, { left, right });

    // result
    expect(guide).toEqual({ labels: [], lines: [] });
  });
});
