// utils
import { getRotatedAnchorSolver } from '../getRotatedAnchorSolver';
import { rotatePoint } from 'utils/math/rotatePoint';

describe('getRotatedAnchorSolver', () => {
  it('should keep the anchor edge fixed in world space for a plain (non-crossing) resize', () => {
    // mock — "e" handle on a 90deg-rotated box, growing (scaleX positive, no crossing)
    const bounds = { height: 50, width: 100, x: 0, y: 0 };

    // before
    const solve = getRotatedAnchorSolver(bounds, 'e', 90, 2, 1);
    const result = solve(200, 50);

    // result
    expect(result.x).toBeCloseTo(-50);
    expect(result.y).toBeCloseTo(50);
  });

  it('should keep the anchor corner fixed in world space when the drag crosses it, not snap back to the original box', () => {
    // mock — a 90deg-rotated square; "se" handle anchored at "nw", dragged into a full symmetric
    // crossing (scaleX/scaleY both negative), same size as before but mirrored to the other side
    const bounds = { height: 100, width: 100, x: 300, y: 300 };
    const oldCenter = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const anchorWorldBefore = rotatePoint({ x: bounds.x, y: bounds.y }, oldCenter, 90);

    // before
    const solve = getRotatedAnchorSolver(bounds, 'se', 90, -1, -1);
    const result = solve(100, 100);

    // result — NOT back at the original position...
    expect(result.x !== bounds.x || result.y !== bounds.y).toBe(true);

    // ...and the anchor corner (now on the box's opposite local side) is still fixed in world space
    const newCenter = { x: result.x + 50, y: result.y + 50 };
    const anchorWorldAfter = rotatePoint({ x: result.x + 100, y: result.y + 100 }, newCenter, 90);

    expect(anchorWorldAfter.x).toBeCloseTo(anchorWorldBefore.x);
    expect(anchorWorldAfter.y).toBeCloseTo(anchorWorldBefore.y);
  });

  it('should keep the anchor edge fixed even when scaleX lands on exactly 0 mid-crossing', () => {
    // mock — "e" handle, anchor is the west edge (x=0); an exact-zero scaleX used to zero out
    // Math.sign(scaleX), collapsing the anchor offset and jumping the west edge away from x=0
    const bounds = { height: 50, width: 100, x: 0, y: 0 };

    // before
    const solve = getRotatedAnchorSolver(bounds, 'e', 0, 0, 1);
    const result = solve(60, 50);

    // result — west edge stays pinned at x=0, box spans [0, 60], not jumped to [-30, 30]
    expect(result.x).toBeCloseTo(0);
  });
});
