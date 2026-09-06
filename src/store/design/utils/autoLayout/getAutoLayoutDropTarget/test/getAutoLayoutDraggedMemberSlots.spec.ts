// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';

// utils
import { getAutoLayoutDraggedMemberSlots } from '../getAutoLayoutDraggedMemberSlots';

const CONTENT_BOX = { height: 300, width: 400, x: 0, y: 0 };
const SIBLINGS = [
  { height: 100, id: 'a', width: 100 },
  { height: 100, id: 'd', width: 100 },
];
const BLOCK = [
  { height: 100, id: '__dragged__', width: 100 },
  { height: 100, id: '__dragged__', width: 100 },
];

describe('getAutoLayoutDraggedMemberSlots', () => {
  it('returns each block member’s contiguous slot for a horizontal frame', () => {
    // action — block appended after [a, d]
    const slots = getAutoLayoutDraggedMemberSlots(LayoutMode.horizontal, 0, AlignmentLayout.topLeft, CONTENT_BOX, SIBLINGS, 2, BLOCK);

    // result — packed right after 'a' and 'd'
    expect(slots).toEqual([
      { x: 200, y: 0 },
      { x: 300, y: 0 },
    ]);
  });

  it('honours item spacing and insertion between siblings', () => {
    // action — block inserted between 'a' and 'd', 20px gap
    const slots = getAutoLayoutDraggedMemberSlots(LayoutMode.horizontal, 20, AlignmentLayout.topLeft, CONTENT_BOX, SIBLINGS, 1, BLOCK);

    // result — 'a' at 0, then the two members at 120 / 240
    expect(slots).toEqual([
      { x: 120, y: 0 },
      { x: 240, y: 0 },
    ]);
  });

  it('lays the members out along the primary axis of a vertical frame', () => {
    // action
    const slots = getAutoLayoutDraggedMemberSlots(LayoutMode.vertical, 0, AlignmentLayout.topLeft, CONTENT_BOX, SIBLINGS, 2, BLOCK);

    // result — stacked below 'a' and 'd'
    expect(slots).toEqual([
      { x: 0, y: 200 },
      { x: 0, y: 300 },
    ]);
  });

  it('returns nothing for an empty block', () => {
    // action
    const slots = getAutoLayoutDraggedMemberSlots(LayoutMode.horizontal, 0, AlignmentLayout.topLeft, CONTENT_BOX, SIBLINGS, 0, []);

    // result
    expect(slots).toEqual([]);
  });
});
