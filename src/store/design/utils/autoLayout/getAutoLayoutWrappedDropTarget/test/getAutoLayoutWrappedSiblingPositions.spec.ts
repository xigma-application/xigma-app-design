// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';

// utils
import { getAutoLayoutWrappedSiblingPositions } from '../getAutoLayoutWrappedSiblingPositions';

const CONTENT_BOX = { height: 400, width: 250, x: 0, y: 0 };
const CHILDREN = [
  { height: 100, id: '1', width: 100 },
  { height: 100, id: '2', width: 100 },
];
const DRAGGED_SIZES = [{ height: 100, id: '__dragged__', width: 100 }];

describe('getAutoLayoutWrappedSiblingPositions', () => {
  it('should report every real sibling’s own simulated position, with room opened up for the dragged item', () => {
    // action — insert the dragged item before both existing children
    const siblingPositions = getAutoLayoutWrappedSiblingPositions({
      alignment: AlignmentLayout.topLeft,
      children: CHILDREN,
      contentBox: CONTENT_BOX,
      counterAxisSpacing: 20,
      draggedSizes: DRAGGED_SIZES,
      index: 0,
      itemSpacing: 20,
      layoutMode: LayoutMode.horizontal,
    });

    // result — '1' shares row 1 with the dragged item, pushed right by its 100px width + gap;
    // '2' no longer fits on that row (100 + 20 + 100 + 20 + 100 = 340 > 250) and wraps to row 2
    expect(siblingPositions).toEqual({ 1: { x: 120, y: 0 }, 2: { x: 0, y: 120 } });
  });

  it('should never include the dragged placeholder itself', () => {
    // action
    const siblingPositions = getAutoLayoutWrappedSiblingPositions({
      alignment: AlignmentLayout.topLeft,
      children: CHILDREN,
      contentBox: CONTENT_BOX,
      counterAxisSpacing: 20,
      draggedSizes: DRAGGED_SIZES,
      index: 2,
      itemSpacing: 20,
      layoutMode: LayoutMode.horizontal,
    });

    // result — specifically not `{ __dragged__: ... }`
    expect(Object.keys(siblingPositions)).toEqual(['1', '2']);
  });

  it('should model a multi-node dragged block as its own individually-sized members, not one merged bounding box', () => {
    // action — a two-member dragged block (e.g. a 2-row-tall multi-select) must occupy exactly as
    // much room as its two real members would, not one fat placeholder sized to their combined
    // bounding box (which would misrepresent how many wrap-rows it actually displaces)
    const twoMemberBlock = [
      { height: 50, id: '__dragged__', width: 50 },
      { height: 50, id: '__dragged__', width: 50 },
    ];
    const siblingPositions = getAutoLayoutWrappedSiblingPositions({
      alignment: AlignmentLayout.topLeft,
      children: [
        { height: 50, id: '1', width: 50 },
        { height: 50, id: '2', width: 50 },
      ],
      contentBox: { height: 400, width: 100, x: 0, y: 0 },
      counterAxisSpacing: 0,
      draggedSizes: twoMemberBlock,
      index: 0,
      itemSpacing: 0,
      layoutMode: LayoutMode.horizontal,
    });

    // result — the two dragged members share row 1 together (50 + 50 = 100 <= 100); '1' and '2'
    // then pack normally onto row 2, NOT pushed down an extra row by an oversized merged placeholder
    expect(siblingPositions).toEqual({ 1: { x: 0, y: 50 }, 2: { x: 50, y: 50 } });
  });
});
