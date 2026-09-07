// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

// utils
import { getAlignedChildLocalPosition } from '../getAlignedChildLocalPosition';

const parent = { height: 200, width: 400 };
const child = { height: 40, width: 60 };
const currentLocal = { x: 17, y: 23 };

describe('getAlignedChildLocalPosition', () => {
  it('should pass the current local position through when there is no alignment', () => {
    expect(getAlignedChildLocalPosition(undefined, parent, child, currentLocal)).toEqual(currentLocal);
  });

  it('should keep a free axis at its current local position', () => {
    expect(getAlignedChildLocalPosition({ horizontal: AlignmentHorizontal.left }, parent, child, currentLocal)).toEqual({ x: 0, y: 23 });
  });

  it('should anchor left/top to 0', () => {
    expect(
      getAlignedChildLocalPosition({ horizontal: AlignmentHorizontal.left, vertical: AlignmentVertical.top }, parent, child, currentLocal),
    ).toEqual({ x: 0, y: 0 });
  });

  it('should anchor center to the midpoint gap', () => {
    expect(
      getAlignedChildLocalPosition(
        { horizontal: AlignmentHorizontal.center, vertical: AlignmentVertical.center },
        parent,
        child,
        currentLocal,
      ),
    ).toEqual({ x: 170, y: 80 });
  });

  it('should anchor right/bottom flush to the far edge', () => {
    expect(
      getAlignedChildLocalPosition(
        { horizontal: AlignmentHorizontal.right, vertical: AlignmentVertical.bottom },
        parent,
        child,
        currentLocal,
      ),
    ).toEqual({ x: 340, y: 160 });
  });
});
