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

const dropTargetAt = (cursor: { x: number; y: number }, draggedSize = NORMAL_SIZE): ReturnType<typeof getAutoLayoutWrappedDropTarget> =>
  getAutoLayoutWrappedDropTarget(LayoutMode.horizontal, 20, 20, AlignmentLayout.topLeft, FRAME, NO_PADDING, CHILDREN, draggedSize, cursor);

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
      NORMAL_SIZE,
      { x: 50, y: 115 },
    );

    // result
    expect(dropTarget.index).toBe(1);
    expect(dropTarget.indicator).toMatchObject({ x: 2, y: 110 });
  });
});
