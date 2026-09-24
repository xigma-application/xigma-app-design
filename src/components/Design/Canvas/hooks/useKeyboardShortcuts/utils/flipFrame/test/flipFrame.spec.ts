// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage, selectNodes } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import {
  AlignmentHorizontal,
  AlignmentLayout,
  AlignmentVertical,
  LayoutGuideColumnsAlign,
  LayoutGuideRowsAlign,
  LayoutGuideType,
  LayoutMode,
  NodeType,
  SizingMode,
} from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { handleFlipSelection } from '../../handleFlipSelection';

const lastRootId = (): string => {
  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addFrame = (x: number, y: number, width: number, height: number, overrides: Partial<TFrameNode> = {}): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [],
      height,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width,
      x,
      y,
      ...overrides,
    }),
  );

  return lastRootId();
};

const addRectangle = (x: number, y: number, width: number, height: number): string => {
  store.dispatch(
    addNode({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width,
      x,
      y,
    }),
  );

  return lastRootId();
};

const nest = (childIds: string[], parentId: string): void => {
  store.dispatch(moveNodes({ nodeIds: childIds, targetIndex: 0, targetParentId: parentId }));
};

const node = <T extends TSceneNode>(id: string): T => selectNodes(store.getState())[id] as T;

describe('flip a single frame', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should keep the frame in place, swap its left and right settings, and mirror a child inside it', () => {
    // mock: a 200x100 frame at 100, a 20-wide rectangle 10px from its left edge
    const frameId = addFrame(100, 0, 200, 100, {
      cornerRadiusTopLeft: 8,
      cornerRadiusTopRight: 0,
      paddingLeft: 4,
      paddingRight: 12,
      strokeLeftWidth: 1,
      strokeRightWidth: 3,
    });
    const rectangleId = addRectangle(110, 20, 20, 20);

    nest([rectangleId], frameId);
    store.dispatch(updateNode({ changes: { x: 110, y: 20 }, id: rectangleId }));
    store.dispatch(setSelection([frameId]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    expect(node<TFrameNode>(frameId)).toMatchObject({
      cornerRadiusTopLeft: 0,
      cornerRadiusTopRight: 8,
      paddingLeft: 12,
      paddingRight: 4,
      strokeLeftWidth: 3,
      strokeRightWidth: 1,
      x: 100,
    });
    expect(node<TRectangleNode>(rectangleId)).toMatchObject({ x: 270, y: 20 });
  });

  it('should mirror a nested frame inside its parent and flip its own settings and children too', () => {
    // mock
    const outerId = addFrame(0, 0, 200, 100);
    const innerId = addFrame(10, 10, 60, 60, { cornerRadiusTopLeft: 5 });
    const rectangleId = addRectangle(15, 20, 10, 10);

    nest([rectangleId], innerId);
    nest([innerId], outerId);
    store.dispatch(updateNode({ changes: { x: 10, y: 10 }, id: innerId }));
    store.dispatch(updateNode({ changes: { x: 15, y: 20 }, id: rectangleId }));
    store.dispatch(setSelection([outerId]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result: inner frame 10px from the right edge, rectangle 5px from the inner frame's right edge
    expect(node<TFrameNode>(innerId)).toMatchObject({ cornerRadiusTopLeft: undefined, cornerRadiusTopRight: 5, x: 130 });
    expect(node<TRectangleNode>(rectangleId).x).toBe(130 + 60 - 5 - 10);
  });

  it("should flip an auto-layout frame's alignment without reversing its children", () => {
    // mock
    const frameId = addFrame(0, 0, 300, 100, { layoutAlignment: AlignmentLayout.topLeft, layoutMode: LayoutMode.horizontal });
    const firstId = addRectangle(0, 0, 20, 20);
    const secondId = addRectangle(0, 0, 20, 20);

    nest([firstId, secondId], frameId);
    store.dispatch(setSelection([frameId]));

    const orderBefore = node<TFrameNode>(frameId).childIds;

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    expect(node<TFrameNode>(frameId).layoutAlignment).toBe(AlignmentLayout.topRight);
    expect(node<TFrameNode>(frameId).childIds).toEqual(orderBefore);
  });

  it('should mirror a grid: reversed column sizes, mirrored cells and cell alignment, auto placement off', () => {
    // mock: two columns, one child with left cell alignment in the first cell
    const frameId = addFrame(0, 0, 200, 100, {
      gridColumnCount: 2,
      gridColumnSizes: [
        { mode: SizingMode.fixed, value: 50 },
        { mode: SizingMode.fill, value: 1 },
      ],
      gridRowCount: 1,
      layoutMode: LayoutMode.grid,
    });
    const childId = addRectangle(0, 0, 20, 20);

    nest([childId], frameId);
    store.dispatch(updateNode({ changes: { gridChildHorizontalAlign: AlignmentHorizontal.left }, id: childId }));
    store.dispatch(setSelection([frameId]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    expect(node<TFrameNode>(frameId)).toMatchObject({
      gridAutoPlacement: false,
      gridColumnSizes: [
        { mode: SizingMode.fill, value: 1 },
        { mode: SizingMode.fixed, value: 50 },
      ],
    });
    expect(node<TRectangleNode>(childId)).toMatchObject({
      gridChildHorizontalAlign: AlignmentHorizontal.right,
      gridColumnAnchorIndex: 1,
      gridRowAnchorIndex: 0,
    });
  });

  it('should mirror a layer spanning several columns and rows by its whole span, on both axes', () => {
    // mock: a 3x3 grid, one layer anchored at column 0 / row 0 spanning 2 columns and 2 rows
    const frameId = addFrame(0, 0, 300, 300, {
      gridAutoPlacement: false,
      gridColumnCount: 3,
      gridRowCount: 3,
      layoutMode: LayoutMode.grid,
    });
    const childId = addRectangle(0, 0, 20, 20);

    nest([childId], frameId);
    store.dispatch(
      updateNode({ changes: { gridColumnAnchorIndex: 0, gridColumnSpan: 2, gridRowAnchorIndex: 0, gridRowSpan: 2 }, id: childId }),
    );
    store.dispatch(setSelection([frameId]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    expect(node<TRectangleNode>(childId)).toMatchObject({
      gridColumnAnchorIndex: 1,
      gridColumnSpan: 2,
      gridRowAnchorIndex: 0,
      gridRowSpan: 2,
    });

    // action
    handleFlipSelection(store.dispatch, 'vertical');

    // result
    expect(node<TRectangleNode>(childId)).toMatchObject({
      gridColumnAnchorIndex: 1,
      gridColumnSpan: 2,
      gridRowAnchorIndex: 1,
      gridRowSpan: 2,
    });
  });

  it('should swap top and bottom settings and mirror children on a vertical flip', () => {
    // mock
    const frameId = addFrame(0, 0, 100, 200, { cornerRadiusBottomLeft: 6, paddingBottom: 2, paddingTop: 9, strokeTopWidth: 4 });
    const rectangleId = addRectangle(10, 10, 20, 20);

    nest([rectangleId], frameId);
    store.dispatch(updateNode({ changes: { x: 10, y: 10 }, id: rectangleId }));
    store.dispatch(setSelection([frameId]));

    // action
    handleFlipSelection(store.dispatch, 'vertical');

    // result
    expect(node<TFrameNode>(frameId)).toMatchObject({
      cornerRadiusTopLeft: 6,
      paddingBottom: 9,
      paddingTop: 2,
      strokeBottomWidth: 4,
      strokeTopWidth: undefined,
      y: 0,
    });
    expect(node<TRectangleNode>(rectangleId).y).toBe(170);
  });

  it("should mirror the children's constraints on the flipped axis only", () => {
    // mock
    const frameId = addFrame(0, 0, 200, 200);
    const leftId = addRectangle(10, 10, 20, 20);
    const centerId = addRectangle(90, 90, 20, 20);
    const unsetId = addRectangle(150, 150, 20, 20);

    nest([leftId, centerId, unsetId], frameId);
    store.dispatch(
      updateNode({ changes: { alignment: { horizontal: AlignmentHorizontal.left, vertical: AlignmentVertical.top } }, id: leftId }),
    );
    store.dispatch(updateNode({ changes: { alignment: { horizontal: AlignmentHorizontal.center } }, id: centerId }));
    store.dispatch(setSelection([frameId]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    expect(node<TRectangleNode>(leftId).alignment).toEqual({ horizontal: AlignmentHorizontal.right, vertical: AlignmentVertical.top });
    expect(node<TRectangleNode>(centerId).alignment).toEqual({ horizontal: AlignmentHorizontal.center });
    expect(node<TRectangleNode>(unsetId).alignment).toEqual({ horizontal: AlignmentHorizontal.right });

    // action
    handleFlipSelection(store.dispatch, 'vertical');

    // result
    expect(node<TRectangleNode>(leftId).alignment).toEqual({ horizontal: AlignmentHorizontal.right, vertical: AlignmentVertical.bottom });
  });

  it("should mirror the frame's layout guide alignment and its own guides on the flipped axis", () => {
    // mock
    const frameId = addFrame(0, 0, 200, 100, {
      guides: [
        { axis: 'x', id: 'vertical-guide', position: 30 },
        { axis: 'y', id: 'horizontal-guide', position: 20 },
      ],
      layoutGuides: [
        { color: '#ff0000', columnsAlign: LayoutGuideColumnsAlign.left, opacity: 10, type: LayoutGuideType.columns },
        { color: '#ff0000', opacity: 10, rowsAlign: LayoutGuideRowsAlign.top, type: LayoutGuideType.rows },
      ],
    });

    store.dispatch(setSelection([frameId]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    expect(node<TFrameNode>(frameId).guides).toEqual([
      { axis: 'x', id: 'vertical-guide', position: 170 },
      { axis: 'y', id: 'horizontal-guide', position: 20 },
    ]);
    expect(node<TFrameNode>(frameId).layoutGuides?.map(({ columnsAlign, rowsAlign }) => [columnsAlign, rowsAlign])).toEqual([
      [LayoutGuideColumnsAlign.right, undefined],
      [undefined, LayoutGuideRowsAlign.top],
    ]);

    // action
    handleFlipSelection(store.dispatch, 'vertical');

    // result
    expect(node<TFrameNode>(frameId).guides?.[1].position).toBe(80);
    expect(node<TFrameNode>(frameId).layoutGuides?.[1].rowsAlign).toBe(LayoutGuideRowsAlign.bottom);
  });

  it('should leave the constraint of an auto-layout flow child alone', () => {
    // mock
    const frameId = addFrame(0, 0, 300, 100, { layoutMode: LayoutMode.horizontal });
    const childId = addRectangle(0, 0, 20, 20);

    nest([childId], frameId);
    store.dispatch(setSelection([frameId]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    expect(node<TRectangleNode>(childId).alignment).toBeUndefined();
  });

  it("should mirror unset alignments from their defaults: a grid child's top-left cell alignment and a frame's top-left auto-layout alignment", () => {
    // mock
    const gridId = addFrame(0, 0, 200, 100, { gridAutoPlacement: false, gridColumnCount: 2, gridRowCount: 2, layoutMode: LayoutMode.grid });
    const cellChildId = addRectangle(0, 0, 20, 20);
    const flowId = addFrame(300, 0, 200, 100, { layoutMode: LayoutMode.horizontal });

    nest([cellChildId], gridId);
    store.dispatch(setSelection([gridId]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');
    handleFlipSelection(store.dispatch, 'vertical');

    // result
    expect(node<TRectangleNode>(cellChildId)).toMatchObject({
      gridChildHorizontalAlign: AlignmentHorizontal.right,
      gridChildVerticalAlign: AlignmentVertical.bottom,
    });

    // action
    store.dispatch(setSelection([flowId]));
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    expect(node<TFrameNode>(flowId).layoutAlignment).toBe(AlignmentLayout.topRight);
  });

  it('should reverse the lines of a wrapping horizontal auto layout on a vertical flip, keeping the order inside each line', () => {
    // mock: 30px children in a 100px wide wrapping row, so the lines are [A B C] and [D]
    const frameId = addFrame(0, 0, 100, 200, { horizontalGap: 0, layoutMode: LayoutMode.horizontal, layoutWrap: true, verticalGap: 0 });
    const ids = [0, 1, 2, 3].map(() => addRectangle(0, 0, 30, 30));

    nest(ids, frameId);
    store.dispatch(setSelection([frameId]));

    const orderBefore = node<TFrameNode>(frameId).childIds;
    const [first, second, third, fourth] = orderBefore;

    // action
    handleFlipSelection(store.dispatch, 'vertical');

    // result
    expect(node<TFrameNode>(frameId).childIds).toEqual([fourth, first, second, third]);
    expect(node<TRectangleNode>(fourth).y).toBeLessThan(node<TRectangleNode>(third).y);
  });

  it('should keep the child order of a wrapping horizontal auto layout on a horizontal flip', () => {
    // mock
    const frameId = addFrame(0, 0, 100, 200, { layoutMode: LayoutMode.horizontal, layoutWrap: true });
    const ids = [0, 1, 2, 3].map(() => addRectangle(0, 0, 30, 30));

    nest(ids, frameId);
    store.dispatch(setSelection([frameId]));

    const orderBefore = node<TFrameNode>(frameId).childIds;

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    expect(node<TFrameNode>(frameId).childIds).toEqual(orderBefore);
  });

  it('should undo the whole frame flip in a single step', () => {
    // mock
    const frameId = addFrame(0, 0, 200, 100, { paddingLeft: 4 });
    const rectangleId = addRectangle(10, 10, 20, 20);

    nest([rectangleId], frameId);
    store.dispatch(updateNode({ changes: { x: 10, y: 10 }, id: rectangleId }));
    store.dispatch(setSelection([frameId]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');
    store.dispatch(undo());

    // result
    expect(node<TFrameNode>(frameId).paddingLeft).toBe(4);
    expect(node<TRectangleNode>(rectangleId).x).toBe(10);
  });
});
