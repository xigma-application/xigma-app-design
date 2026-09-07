// utils
import { getNodeAbsoluteFromParentPosition } from '../getNodeAbsoluteFromParentPosition';
import { getNodePositionInParent } from '../getNodePositionInParent';

describe('getNodePositionInParent', () => {
  it('should subtract the parent origin for an unrotated parent', () => {
    const parent = { height: 200, rotation: 0, width: 300, x: 100, y: 50 };

    expect(getNodePositionInParent({ x: 130, y: 90 }, parent)).toEqual({ x: 30, y: 40 });
  });

  it('should express the position in the parent local (unrotated) space when the parent is rotated', () => {
    // parent rotated 90deg about its centre (250, 150); a child whose top-left sits at the parent's
    // own top-left corner in world space must read as local (0, 0)
    const parent = { height: 200, rotation: 90, width: 300, x: 100, y: 50 };
    const worldParentTopLeft = getNodeAbsoluteFromParentPosition({ x: 0, y: 0 }, parent);

    const local = getNodePositionInParent(worldParentTopLeft, parent);

    expect(local.x).toBeCloseTo(0);
    expect(local.y).toBeCloseTo(0);
  });

  it('should round-trip with getNodeAbsoluteFromParentPosition for a rotated parent', () => {
    const parent = { height: 120, rotation: 33, width: 240, x: 12, y: -40 };
    const node = { x: 88, y: 17 };

    const back = getNodeAbsoluteFromParentPosition(getNodePositionInParent(node, parent), parent);

    expect(back.x).toBeCloseTo(node.x);
    expect(back.y).toBeCloseTo(node.y);
  });
});

describe('getNodeAbsoluteFromParentPosition', () => {
  it('should add the parent origin for an unrotated parent', () => {
    const parent = { height: 200, rotation: 0, width: 300, x: 100, y: 50 };

    expect(getNodeAbsoluteFromParentPosition({ x: 30, y: 40 }, parent)).toEqual({ x: 130, y: 90 });
  });
});
