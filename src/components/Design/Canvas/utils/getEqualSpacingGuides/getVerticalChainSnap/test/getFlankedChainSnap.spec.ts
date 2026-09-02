// utils
import { getEdges } from '../../../getDistanceGuides/getEdges';
import { getFlankedChainSnap } from '../getFlankedChainSnap';

describe('getFlankedChainSnap', () => {
  it('should centre the active shape between two flanking neighbours when close to the ideal equal-gap position', () => {
    // mock — top (0..80) and bottom (220..270) leave a 140px span for a 100-tall active shape,
    // so the ideal centred gap is 20px each side; active sits at y:102, 2px short of y:100
    const top = { bounds: { height: 80, width: 100, x: 0, y: 0 } };
    const bottom = { bounds: { height: 50, width: 100, x: 0, y: 220 } };
    const active = getEdges({ height: 100, width: 100, x: 0, y: 102 });

    // action
    const snap = getFlankedChainSnap(active, top, bottom, 4);

    // result
    expect(snap.deltaY).toBe(-2);
    expect(snap.lines).toHaveLength(2);
    expect(snap.labels.every((label) => label.text === '20')).toBe(true);
  });

  it('should return no snap when the ideal gap is not positive (the flanking shapes overlap or the active shape does not fit)', () => {
    // mock — only a 60px span for a 100-tall active shape
    const top = { bounds: { height: 80, width: 100, x: 0, y: 0 } };
    const bottom = { bounds: { height: 50, width: 100, x: 0, y: 140 } };
    const active = getEdges({ height: 100, width: 100, x: 0, y: 90 });

    // action
    const snap = getFlankedChainSnap(active, top, bottom, 4);

    // result
    expect(snap).toEqual({ deltaY: 0, labels: [], lines: [] });
  });

  it('should return no snap when the mismatch exceeds tolerance', () => {
    // mock — same span as the success case, but active is 20px off the centred y:100
    const top = { bounds: { height: 80, width: 100, x: 0, y: 0 } };
    const bottom = { bounds: { height: 50, width: 100, x: 0, y: 220 } };
    const active = getEdges({ height: 100, width: 100, x: 0, y: 120 });

    // action
    const snap = getFlankedChainSnap(active, top, bottom, 4);

    // result
    expect(snap).toEqual({ deltaY: 0, labels: [], lines: [] });
  });
});
