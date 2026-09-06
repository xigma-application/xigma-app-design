// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';

// utils
import { getMemberSlots } from '../getMemberSlots';

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

describe('getMemberSlots', () => {
  it('should lay the block out contiguously, ignoring the sibling layout, when a chasm is open', () => {
    // action
    const slots = getMemberSlots(true, true, LayoutMode.horizontal, 10, 0, AlignmentLayout.topLeft, CONTENT_BOX, SIBLINGS, 4, BLOCK);

    // result — members packed touching each other along the primary axis, not wrapped into the grid
    expect(slots).toEqual([
      { x: 0, y: 0 },
      { x: 110, y: 0 },
    ]);
  });

  it('should route through the wrapped sibling layout, in block order, when there is no chasm', () => {
    // action — block appended after row 2
    const slots = getMemberSlots(false, true, LayoutMode.horizontal, 0, 0, AlignmentLayout.topLeft, CONTENT_BOX, SIBLINGS, 4, BLOCK);

    // result — the two members sit side by side on the third row
    expect(slots).toEqual([
      { x: 0, y: 200 },
      { x: 100, y: 200 },
    ]);
  });
});
