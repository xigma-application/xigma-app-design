// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';

// utils
import { getAutoLayoutWrappedSiblingPositions } from '../getAutoLayoutWrappedSiblingPositions';

const CONTENT_BOX = { height: 400, width: 250, x: 0, y: 0 };
const CHILDREN = [
  { height: 100, id: '1', width: 100 },
  { height: 100, id: '2', width: 100 },
];
const DRAGGED_SIZE = { height: 100, width: 100 };

describe('getAutoLayoutWrappedSiblingPositions', () => {
  it('should report every real sibling’s own simulated position, with room opened up for the dragged item', () => {
    // action — insert the dragged item before both existing children
    const siblingPositions = getAutoLayoutWrappedSiblingPositions(
      LayoutMode.horizontal,
      20,
      20,
      AlignmentLayout.topLeft,
      CONTENT_BOX,
      CHILDREN,
      0,
      DRAGGED_SIZE,
    );

    // result — '1' shares row 1 with the dragged item, pushed right by its 100px width + gap;
    // '2' no longer fits on that row (100 + 20 + 100 + 20 + 100 = 340 > 250) and wraps to row 2
    expect(siblingPositions).toEqual({ 1: { x: 120, y: 0 }, 2: { x: 0, y: 120 } });
  });

  it('should never include the dragged placeholder itself', () => {
    // action
    const siblingPositions = getAutoLayoutWrappedSiblingPositions(
      LayoutMode.horizontal,
      20,
      20,
      AlignmentLayout.topLeft,
      CONTENT_BOX,
      CHILDREN,
      2,
      DRAGGED_SIZE,
    );

    // result — specifically not `{ __dragged__: ... }`
    expect(Object.keys(siblingPositions)).toEqual(['1', '2']);
  });
});
