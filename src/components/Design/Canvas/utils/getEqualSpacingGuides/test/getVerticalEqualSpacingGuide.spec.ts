// utils
import { getEdges } from '../../getDistanceGuides/getEdges';
import { getVerticalEqualSpacingGuide } from '../getVerticalEqualSpacingGuide';

const ACTIVE = getEdges({ height: 100, width: 100, x: 0, y: 100 });

describe('getVerticalEqualSpacingGuide', () => {
  it('should return a guide for each gap when the top and bottom gaps are equal', () => {
    // before — 20px gap on both sides
    const top = getEdges({ height: 80, width: 100, x: 0, y: 0 });
    const bottom = getEdges({ height: 50, width: 100, x: 0, y: 220 });

    // action
    const guide = getVerticalEqualSpacingGuide(ACTIVE, { bottom, top });

    // result
    expect(guide.lines).toEqual([
      { dashed: false, x1: 50, x2: 50, y1: 80, y2: 100 },
      { dashed: false, x1: 50, x2: 50, y1: 200, y2: 220 },
    ]);
    expect(guide.labels).toEqual([
      { anchor: { x: 50, y: 90 }, offsetDirection: { x: -1, y: 0 }, text: '20' },
      { anchor: { x: 50, y: 210 }, offsetDirection: { x: -1, y: 0 }, text: '20' },
    ]);
  });

  it('should return no guide when the gaps are not equal', () => {
    // before — 20px above, 40px below
    const top = getEdges({ height: 80, width: 100, x: 0, y: 0 });
    const bottom = getEdges({ height: 50, width: 100, x: 0, y: 240 });

    // action
    const guide = getVerticalEqualSpacingGuide(ACTIVE, { bottom, top });

    // result
    expect(guide).toEqual({ labels: [], lines: [] });
  });

  it('should return no guide when only one side has a neighbor', () => {
    // before
    const top = getEdges({ height: 80, width: 100, x: 0, y: 0 });

    // action
    const guide = getVerticalEqualSpacingGuide(ACTIVE, { bottom: null, top });

    // result
    expect(guide).toEqual({ labels: [], lines: [] });
  });

  it('should return no guide when a "gap" is actually flush contact (zero distance)', () => {
    // before — top neighbor touches the active shape's top edge exactly
    const top = getEdges({ height: 100, width: 100, x: 0, y: 0 });
    const bottom = getEdges({ height: 50, width: 100, x: 0, y: 200 });

    // action
    const guide = getVerticalEqualSpacingGuide(ACTIVE, { bottom, top });

    // result
    expect(guide).toEqual({ labels: [], lines: [] });
  });
});
