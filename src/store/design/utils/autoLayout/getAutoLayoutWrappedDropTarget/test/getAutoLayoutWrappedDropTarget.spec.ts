// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TAutoLayoutPadding } from '../../getAutoLayoutContentBox';

// utils
import { getAutoLayoutWrappedDropTarget } from '../getAutoLayoutWrappedDropTarget';

const NO_PADDING: TAutoLayoutPadding = { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 };

// a 250-wide frame fits exactly two 100-wide children per row (100 + 20 gap + 100 = 220 <= 250), so
// a third 100-wide child wraps onto its own second row, flush left under the first — the exact
// shape reported as broken: 1 and 2 share row 1, 3 sits alone on row 2
const FRAME = { height: 400, width: 250, x: 0, y: 0 };
const CHILDREN = [
  { height: 100, id: '1', width: 100 },
  { height: 100, id: '2', width: 100 },
  { height: 100, id: '3', width: 100 },
];
const NORMAL_SIZE = { height: 100, width: 100 };

const asBlock = (draggedSize: { height: number; width: number }): { height: number; id: string; width: number }[] => [
  { ...draggedSize, id: '__dragged__' },
];

const dropTargetAt = (cursor: { x: number; y: number }, draggedSize = NORMAL_SIZE): ReturnType<typeof getAutoLayoutWrappedDropTarget> =>
  getAutoLayoutWrappedDropTarget(
    LayoutMode.horizontal,
    20,
    20,
    AlignmentLayout.topLeft,
    FRAME,
    NO_PADDING,
    CHILDREN,
    null,
    draggedSize,
    asBlock(draggedSize),
    cursor,
  );

// same-parent reorder of '3' itself: '3' is excluded from the sibling list (it's the dragged node),
// leaving only 1 and 2, which alone fit on a single row — originalIndex lets the row-detection step
// reinsert '3'’s own placeholder at its pre-drag slot so its row still exists for cursor purposes
const SIBLINGS_WITHOUT_3 = [
  { height: 100, id: '1', width: 100 },
  { height: 100, id: '2', width: 100 },
];

describe('getAutoLayoutWrappedDropTarget', () => {
  it('should insert between 1 and 2 when the cursor sits in their own row-1 gap', () => {
    // action
    const dropTarget = dropTargetAt({ x: 118, y: 50 });

    // result — 1, [dragged], 2, 3
    expect(dropTarget.index).toBe(1);
    expect(dropTarget.indicator).toMatchObject({ x: 110, y: 2 });
  });

  it('should offer "after 2" when hovering past the last item of row 1, regardless of whether the dragged item would actually fit there', () => {
    // action — a normal 100-wide item, which fits fine
    const dropTarget = dropTargetAt({ x: 240, y: 50 });

    // result — logically after '2' (index 2, i.e. before '3'), same as Figma: the indicator is a
    // suggestion of where in the order it lands, not a live preview of the post-rewrap geometry
    expect(dropTarget.index).toBe(2);
    expect(dropTarget.indicator).toMatchObject({ x: 230, y: 2 });
  });

  it('should give the exact same "after 2" result even for an oversized item that could never actually fit in row 1', () => {
    // action — regression: fit-based reasoning used to make this jump to a completely different
    // row (or refuse the position); the indicator must not depend on whether it fits — the real
    // wrap engine re-flows everything correctly once the drop actually commits
    const dropTarget = dropTargetAt({ x: 240, y: 50 }, { height: 100, width: 300 });

    // result — identical index and indicator to the normal-sized case above
    expect(dropTarget.index).toBe(2);
    expect(dropTarget.indicator).toMatchObject({ x: 230, y: 2 });
  });

  it('should append at the very end when hovering past the last item of the last row', () => {
    // action
    const dropTarget = dropTargetAt({ x: 240, y: 150 });

    // result
    expect(dropTarget.index).toBe(3);
    expect(dropTarget.indicator).toMatchObject({ x: 110, y: 122 });
  });

  it('should hug 3’s own left wall in row 2 when dragging to its left edge', () => {
    // action
    const dropTarget = dropTargetAt({ x: 20, y: 150 });

    // result — 1, 2, [dragged], 3
    expect(dropTarget.index).toBe(2);
    expect(dropTarget.indicator).toMatchObject({ x: 2, y: 122 });
  });

  it('should hug 3’s own left wall the exact same way for a narrow item that would technically still fit in row 1', () => {
    // action — regression: a narrow item used to be pulled back into row 1 (the nearest-fit row)
    // instead of hugging row 2's own left wall where the cursor actually was
    const dropTarget = dropTargetAt({ x: 20, y: 150 }, { height: 100, width: 10 });

    // result
    expect(dropTarget.index).toBe(2);
    expect(dropTarget.indicator).toMatchObject({ x: 2, y: 122 });
  });

  it('should hug 3’s own left wall the exact same way for an oversized item that could never share a row with anything', () => {
    // action
    const dropTarget = dropTargetAt({ x: 20, y: 150 }, { height: 100, width: 300 });

    // result
    expect(dropTarget.index).toBe(2);
    expect(dropTarget.indicator).toMatchObject({ x: 2, y: 122 });
  });

  it('should apply the same row-aware logic on the vertical axis, for a vertical (column-wrapping) frame', () => {
    // action — mirrors the row-1-gap scenario above, rotated
    const dropTarget = getAutoLayoutWrappedDropTarget(
      LayoutMode.vertical,
      20,
      20,
      AlignmentLayout.topLeft,
      { height: 250, width: 400, x: 0, y: 0 },
      NO_PADDING,
      CHILDREN,
      null,
      NORMAL_SIZE,
      asBlock(NORMAL_SIZE),
      { x: 50, y: 115 },
    );

    // result
    expect(dropTarget.index).toBe(1);
    expect(dropTarget.indicator).toMatchObject({ x: 2, y: 110 });
  });
});

describe('getAutoLayoutWrappedDropTarget — same-parent reorder (originalIndex reinstates the dragged item’s own row)', () => {
  it('should leave 1 and 2 untouched when reordering 3 slightly within its own row, which nothing else shares', () => {
    // action — '3' is excluded from the sibling list (it's the dragged node), so without
    // originalIndex its own row would collapse and the cursor would misresolve into row 1
    const dropTarget = getAutoLayoutWrappedDropTarget(
      LayoutMode.horizontal,
      20,
      20,
      AlignmentLayout.topLeft,
      FRAME,
      NO_PADDING,
      SIBLINGS_WITHOUT_3,
      2,
      NORMAL_SIZE,
      asBlock(NORMAL_SIZE),
      { x: 20, y: 150 },
    );

    // result — 3 stays alone on row 2; 1 and 2 must not react at all
    expect(dropTarget.index).toBe(2);
    expect(dropTarget.siblingPositions).toMatchObject({ '1': { x: 0, y: 0 }, '2': { x: 120, y: 0 } });
  });

  it('should push 1 and 2 onto row 2 to make room in row 1, for an item the combined size of both', () => {
    // action — matches Figma: even when the dragged item is as wide as 1 and 2 put together,
    // dropping it at the very start of row 1 reflows 1 and 2 onto row 2, rather than letting them
    // overflow row 1's real capacity
    const dropTarget = getAutoLayoutWrappedDropTarget(
      LayoutMode.horizontal,
      20,
      20,
      AlignmentLayout.topLeft,
      FRAME,
      NO_PADDING,
      SIBLINGS_WITHOUT_3,
      2,
      { height: 100, width: 220 },
      asBlock({ height: 100, width: 220 }),
      { x: 10, y: 50 },
    );

    // result — 3, then 1 and 2 pushed down to row 2
    expect(dropTarget.index).toBe(0);
    expect(dropTarget.siblingPositions).toMatchObject({ '1': { x: 0, y: 120 }, '2': { x: 120, y: 120 } });
  });

  it('should reset to a fresh (non-hysteretic) insertion when the dragged item is moved into a different row than its own', () => {
    // action — '3'’s own original slot (index 2) falls outside row 1's range, so no row-local
    // originalIndex hysteresis anchor applies; the drop is a plain fresh insertion into row 1
    const dropTarget = getAutoLayoutWrappedDropTarget(
      LayoutMode.horizontal,
      20,
      20,
      AlignmentLayout.topLeft,
      FRAME,
      NO_PADDING,
      SIBLINGS_WITHOUT_3,
      2,
      NORMAL_SIZE,
      asBlock(NORMAL_SIZE),
      { x: 118, y: 50 },
    );

    // result — 1, [dragged], 2 in row 1; 2 alone wraps onto row 2 since all three no longer fit
    expect(dropTarget.index).toBe(1);
    expect(dropTarget.siblingPositions).toMatchObject({ '1': { x: 0, y: 0 }, '2': { x: 0, y: 120 } });
  });
});

describe('getAutoLayoutWrappedDropTarget — multi-node reorder distributes the block as its own members', () => {
  // 6 × 50px children in a 100-wide frame, no gaps: rows [1,2] / [3,4] / [5,6]. Dragging the block
  // {3,4,5} — which itself spans two rows in the current layout — to the very start of row 1.
  const SMALL_FRAME = { height: 400, width: 100, x: 0, y: 0 };
  const REAL_SIBLINGS = [
    { height: 50, id: '1', width: 50 },
    { height: 50, id: '2', width: 50 },
    { height: 50, id: '6', width: 50 },
  ];
  const BLOCK_BBOX = { height: 100, width: 100 };
  const BLOCK_MEMBERS = [
    { height: 50, id: '__dragged__', width: 50 },
    { height: 50, id: '__dragged__', width: 50 },
    { height: 50, id: '__dragged__', width: 50 },
  ];

  it('reflows 1 → row 2, 2 → row 3, 6 stays — not 1 and 2 dumped together a row too far down', () => {
    // action
    const dropTarget = getAutoLayoutWrappedDropTarget(
      LayoutMode.horizontal,
      0,
      0,
      AlignmentLayout.topLeft,
      SMALL_FRAME,
      NO_PADDING,
      REAL_SIBLINGS,
      2,
      BLOCK_BBOX,
      BLOCK_MEMBERS,
      { x: 10, y: 25 },
    );

    // result — rows become [block,block] / [block,1] / [2,6]: 1 slides to row 2, 2 to row 3, 6
    // holds. Regression: one merged 100×100 placeholder took a whole double-height row of its own,
    // shoving 1 AND 2 down together onto what reads as row 3.
    expect(dropTarget.index).toBe(0);
    expect(dropTarget.siblingPositions).toEqual({ 1: { x: 50, y: 50 }, 2: { x: 0, y: 100 }, 6: { x: 50, y: 100 } });
  });
});
