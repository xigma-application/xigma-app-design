// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';

// utils
import { getAutoLayoutWrappedDraggedMemberSlots } from '../getAutoLayoutWrappedDraggedMemberSlots';

// content box holds two 100px columns per row
const CONTENT_BOX = { height: 600, width: 200, x: 0, y: 0 };
const SIBLINGS = [
  { height: 100, id: '1', width: 100 },
  { height: 100, id: '2', width: 100 },
  { height: 100, id: 'e', width: 100 },
  { height: 100, id: 'f', width: 100 },
];
const BLOCK = [
  { height: 100, id: '__dragged__', width: 100 },
  { height: 100, id: '__dragged__', width: 100 },
];

describe('getAutoLayoutWrappedDraggedMemberSlots', () => {
  it('returns each block member’s absolute final wrapped slot, in block order', () => {
    // action — block appended after row 2
    const slots = getAutoLayoutWrappedDraggedMemberSlots(
      LayoutMode.horizontal,
      0,
      0,
      AlignmentLayout.topLeft,
      CONTENT_BOX,
      SIBLINGS,
      4,
      BLOCK,
    );

    // result — the two members sit side by side on the third row
    expect(slots).toEqual([
      { x: 0, y: 200 },
      { x: 100, y: 200 },
    ]);
  });

  it('reflects a wrap split when the block straddles two rows', () => {
    // action — block spliced one slot earlier: [1,2,e] + block + [f] wraps as [1,2] / [e,·] / [·,f]
    const slots = getAutoLayoutWrappedDraggedMemberSlots(
      LayoutMode.horizontal,
      0,
      0,
      AlignmentLayout.topLeft,
      CONTENT_BOX,
      SIBLINGS,
      3,
      BLOCK,
    );

    // result — first member ends row 2, second member opens row 3
    expect(slots).toEqual([
      { x: 100, y: 100 },
      { x: 0, y: 200 },
    ]);
  });

  it('returns nothing when the block is empty', () => {
    // action
    const slots = getAutoLayoutWrappedDraggedMemberSlots(
      LayoutMode.horizontal,
      0,
      0,
      AlignmentLayout.topLeft,
      CONTENT_BOX,
      SIBLINGS,
      0,
      [],
    );

    // result
    expect(slots).toEqual([]);
  });
});
