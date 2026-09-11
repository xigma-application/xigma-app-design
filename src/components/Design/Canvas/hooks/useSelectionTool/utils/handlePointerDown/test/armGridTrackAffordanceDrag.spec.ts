import { RefObject } from 'react';

// store
import { addNode, deleteNode, setGridSettingsPanelOpen, setGridTrackSelection, setPanelGridTrackSelection, updateNode } from 'store/design/slice';
import { selectActivePage, selectGridTrackSelection, selectIsGridSettingsPanelOpen, selectPanelGridTrackSelection } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';

// utils
import { armGridTrackAffordanceDrag } from '../armGridTrackAffordanceDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'setPointerCapture').mockImplementation(() => undefined);

  return canvas;
};

const event = { pointerId: 1 } as PointerEvent;
const point = { x: 10, y: 20 };

const addFrame = (overrides: { childIds?: string[]; gridAutoPlacement?: boolean; gridColumnCount?: number } = {}): string => {
  store.dispatch(
    addNode({
      childIds: overrides.childIds ?? [],
      clipContent: true,
      fill: '#fff',
      gridAutoPlacement: overrides.gridAutoPlacement ?? false,
      gridColumnCount: overrides.gridColumnCount ?? 4,
      height: 200,
      layoutMode: LayoutMode.grid,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 400,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addChild = (gridColumnAnchorIndex: number, gridColumnSpan = 1): string => {
  store.dispatch(
    addNode({
      fill: '#000',
      gridColumnAnchorIndex,
      gridColumnSpan,
      gridRowAnchorIndex: 0,
      height: 10,
      name: 'child',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    } as never),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('armGridTrackAffordanceDrag', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setGridTrackSelection(null));
    store.dispatch(setPanelGridTrackSelection(null));
    store.dispatch(setGridSettingsPanelOpen(false));
  });

  it('should select the grabbed track, open the panel and arm the drag with a ghost seeded at the pointer, when nothing was selected yet', () => {
    // mock
    const frameId = addFrame();
    const canvas = createCanvas();
    const dragRef: RefObject<TGridTrackAffordanceDragState | null> = { current: null };

    // before
    armGridTrackAffordanceDrag(canvas, event, dragRef, store.dispatch, frameId, 'column', 2, point);

    // result
    expect(selectGridTrackSelection(store.getState())).toEqual({ axis: 'column', frameId, indices: [2] });
    expect(selectPanelGridTrackSelection(store.getState())).toEqual({ axis: 'column', frameId, indices: [2] });
    expect(selectIsGridSettingsPanelOpen(store.getState())).toBe(true);
    expect(dragRef.current).toMatchObject({
      axis: 'column',
      dropIndex: 2,
      frameId,
      hasMoved: false,
      sourceIndices: [2],
    });
    // the ghost starts exactly at the grab point along the drag's own axis
    expect(dragRef.current?.ghostPosition.x).toBe(point.x);
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should seed the ghost along the pointer’s y position for a row-axis grab', () => {
    // mock
    const frameId = addFrame();
    const canvas = createCanvas();
    const dragRef: RefObject<TGridTrackAffordanceDragState | null> = { current: null };

    // before
    armGridTrackAffordanceDrag(canvas, event, dragRef, store.dispatch, frameId, 'row', 0, point);

    // result
    expect(dragRef.current?.ghostPosition.y).toBe(point.y);
  });

  it('should keep the whole existing multi-selection as the drag block when grabbing an already-selected track', () => {
    // mock
    const frameId = addFrame();
    const canvas = createCanvas();
    const dragRef: RefObject<TGridTrackAffordanceDragState | null> = { current: null };

    store.dispatch(setGridTrackSelection({ axis: 'column', frameId, indices: [1, 2, 3] }));

    // before — grabbing track 2, which is already part of the selection
    armGridTrackAffordanceDrag(canvas, event, dragRef, store.dispatch, frameId, 'column', 2, point);

    // result — selection is untouched, and the whole block drags together, anchored at its lowest index
    expect(selectGridTrackSelection(store.getState())).toEqual({ axis: 'column', frameId, indices: [1, 2, 3] });
    expect(dragRef.current).toMatchObject({ dropIndex: 1, sourceIndices: [1, 2, 3] });
  });

  it('should collapse the selection to the grabbed track’s own spanning group when it is not yet selected', () => {
    // mock
    const childId = addChild(1, 2);
    const frameId = addFrame({ childIds: [childId] });

    store.dispatch(updateNode({ changes: { parentId: frameId }, id: childId }));

    const canvas = createCanvas();
    const dragRef: RefObject<TGridTrackAffordanceDragState | null> = { current: null };

    // before — grabbing track 2, which belongs to a child spanning columns 1-2
    armGridTrackAffordanceDrag(canvas, event, dragRef, store.dispatch, frameId, 'column', 2, point);

    // result
    expect(selectGridTrackSelection(store.getState())).toEqual({ axis: 'column', frameId, indices: [1, 2] });
    expect(dragRef.current).toMatchObject({ dropIndex: 1, sourceIndices: [1, 2] });
  });

  it('should do nothing when the referenced frame no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const dragRef: RefObject<TGridTrackAffordanceDragState | null> = { current: null };

    // before
    armGridTrackAffordanceDrag(canvas, event, dragRef, store.dispatch, 'missing', 'column', 0, point);

    // result
    expect(dragRef.current).toBeNull();
    expect(selectIsGridSettingsPanelOpen(store.getState())).toBe(false);
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
  });
});
