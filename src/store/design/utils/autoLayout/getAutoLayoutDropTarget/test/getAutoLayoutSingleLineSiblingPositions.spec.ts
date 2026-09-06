// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';

// utils
import { getAutoLayoutSingleLineSiblingPositions } from '../getAutoLayoutSingleLineSiblingPositions';

const CONTENT_BOX = { height: 100, width: 600, x: 0, y: 0 };
// siblings left after a non-adjacent {1,4} block is lifted out of [1,2,3,4]
const SIBLINGS = [
  { height: 100, id: '2', width: 100 },
  { height: 100, id: '3', width: 100 },
];
const BLOCK = [
  { height: 100, id: '__dragged__', width: 100 },
  { height: 100, id: '__dragged__', width: 100 },
];

describe('getAutoLayoutSingleLineSiblingPositions', () => {
  it('opens room for the block’s individual members, not one merged bounding box', () => {
    // action — block re-enters at the front; '2' and '3' should shift right by exactly two cells
    const siblingPositions = getAutoLayoutSingleLineSiblingPositions(
      LayoutMode.horizontal,
      0,
      AlignmentLayout.topLeft,
      CONTENT_BOX,
      SIBLINGS,
      0,
      BLOCK,
    );

    // result — NOT pushed out past x 400 as a full-row-wide merged placeholder would
    expect(siblingPositions).toEqual({ 2: { x: 200, y: 0 }, 3: { x: 300, y: 0 } });
  });

  it('never includes the dragged placeholder itself', () => {
    // action
    const siblingPositions = getAutoLayoutSingleLineSiblingPositions(
      LayoutMode.horizontal,
      0,
      AlignmentLayout.topLeft,
      CONTENT_BOX,
      SIBLINGS,
      2,
      BLOCK,
    );

    // result
    expect(Object.keys(siblingPositions)).toEqual(['2', '3']);
  });

  it('stacks the members along a vertical frame’s primary axis', () => {
    // action
    const siblingPositions = getAutoLayoutSingleLineSiblingPositions(
      LayoutMode.vertical,
      0,
      AlignmentLayout.topLeft,
      { height: 600, width: 100, x: 0, y: 0 },
      SIBLINGS,
      0,
      BLOCK,
    );

    // result
    expect(siblingPositions).toEqual({ 2: { x: 0, y: 200 }, 3: { x: 0, y: 300 } });
  });
});
