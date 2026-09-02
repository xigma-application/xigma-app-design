// utils
import { getEdges } from '../../../getDistanceGuides/getEdges';
import { getFlankedChainSnap } from '../getFlankedChainSnap';

describe('getFlankedChainSnap', () => {
  it('should centre the active shape between two flanking neighbours when close to the ideal equal-gap position', () => {
    // mock — left (0..80) and right (220..270) leave a 140px span for a 100-wide active shape,
    // so the ideal centred gap is 20px each side; active sits at x:102, 2px short of x:100
    const left = { bounds: { height: 100, width: 80, x: 0, y: 0 } };
    const right = { bounds: { height: 100, width: 50, x: 220, y: 0 } };
    const active = getEdges({ height: 100, width: 100, x: 102, y: 0 });

    // action
    const snap = getFlankedChainSnap(active, left, right, 4);

    // result
    expect(snap.deltaX).toBe(-2);
    expect(snap.lines).toHaveLength(2);
    expect(snap.labels.every((label) => label.text === '20')).toBe(true);
  });

  it('should return no snap when the ideal gap is not positive (the flanking shapes overlap or the active shape does not fit)', () => {
    // mock — only a 60px span for a 100-wide active shape
    const left = { bounds: { height: 100, width: 80, x: 0, y: 0 } };
    const right = { bounds: { height: 100, width: 50, x: 140, y: 0 } };
    const active = getEdges({ height: 100, width: 100, x: 90, y: 0 });

    // action
    const snap = getFlankedChainSnap(active, left, right, 4);

    // result
    expect(snap).toEqual({ deltaX: 0, labels: [], lines: [] });
  });

  it('should return no snap when the mismatch exceeds tolerance', () => {
    // mock — same span as the success case, but active is 20px off the centred x:100
    const left = { bounds: { height: 100, width: 80, x: 0, y: 0 } };
    const right = { bounds: { height: 100, width: 50, x: 220, y: 0 } };
    const active = getEdges({ height: 100, width: 100, x: 120, y: 0 });

    // action
    const snap = getFlankedChainSnap(active, left, right, 4);

    // result
    expect(snap).toEqual({ deltaX: 0, labels: [], lines: [] });
  });
});
