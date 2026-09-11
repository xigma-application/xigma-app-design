import { RefObject } from 'react';

// store
import { addNode, deleteNode, setGridTrackSelection, setPanelGridTrackSelection } from 'store/design/slice';
import { selectActivePage, selectGridTrackSelection, selectPanelGridTrackSelection } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';

// utils
import { disarmGridTrackAffordanceDrag } from '../disarmGridTrackAffordanceDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'releasePointerCapture').mockImplementation(() => undefined);

  return canvas;
};

const event = { pointerId: 7 } as PointerEvent;

const addFrame = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      gridAutoPlacement: false,
      gridColumnCount: 3,
      gridColumnSizes: [
        { mode: SizingMode.fixed, value: 80 },
        { mode: SizingMode.fixed, value: 100 },
        { mode: SizingMode.fixed, value: 120 },
      ],
      height: 200,
      horizontalGap: 0,
      layoutMode: LayoutMode.grid,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 300,
      x: 0,
      y: 0,
    }),
  );

  return selectActivePage(store.getState()).rootOrder.slice(-1)[0];
};

describe('disarmGridTrackAffordanceDrag', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setGridTrackSelection(null));
    store.dispatch(setPanelGridTrackSelection(null));
  });

  it('should do nothing when no grid track drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const dragRef: RefObject<TGridTrackAffordanceDragState | null> = { current: null };

    // before
    disarmGridTrackAffordanceDrag(canvas, event, store.dispatch, dragRef);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should commit the reorder, publish the new selection, clear the drag state and release pointer capture', () => {
    // mock
    const frameId = addFrame();
    const canvas = createCanvas();
    const dragState: TGridTrackAffordanceDragState = {
      axis: 'column',
      dropIndex: 3,
      frameId,
      ghostPosition: { x: 0, y: 0 },
      hasMoved: true,
      sourceIndices: [0],
    };
    const dragRef: RefObject<TGridTrackAffordanceDragState | null> = { current: dragState };

    // before
    disarmGridTrackAffordanceDrag(canvas, event, store.dispatch, dragRef);

    // result — track 0 lands at the end, and the selection follows it there
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [
        { mode: SizingMode.fixed, value: 100 },
        { mode: SizingMode.fixed, value: 120 },
        { mode: SizingMode.fixed, value: 80 },
      ],
    });
    expect(selectGridTrackSelection(store.getState())).toEqual({ axis: 'column', frameId, indices: [2] });
    expect(selectPanelGridTrackSelection(store.getState())).toEqual({ axis: 'column', frameId, indices: [2] });
    expect(dragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(7);
  });

  it('should not publish a new selection when the reorder is rejected (e.g. an identity move)', () => {
    // mock
    const frameId = addFrame();
    const canvas = createCanvas();
    const dragState: TGridTrackAffordanceDragState = {
      axis: 'column',
      dropIndex: 0,
      frameId,
      ghostPosition: { x: 0, y: 0 },
      hasMoved: true,
      sourceIndices: [0],
    };
    const dragRef: RefObject<TGridTrackAffordanceDragState | null> = { current: dragState };

    // before — dropping track 0 back onto its own slot is an identity move, rejected by the commit
    disarmGridTrackAffordanceDrag(canvas, event, store.dispatch, dragRef);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [
        { mode: SizingMode.fixed, value: 80 },
        { mode: SizingMode.fixed, value: 100 },
        { mode: SizingMode.fixed, value: 120 },
      ],
    });
    expect(selectGridTrackSelection(store.getState())).toBeNull();
    expect(dragRef.current).toBeNull();
  });

  it('should not touch the store when the pointer never actually moved — a plain grip click', () => {
    // mock
    const frameId = addFrame();
    const canvas = createCanvas();
    const dragState: TGridTrackAffordanceDragState = {
      axis: 'column',
      dropIndex: 2,
      frameId,
      ghostPosition: { x: 0, y: 0 },
      hasMoved: false,
      sourceIndices: [0],
    };
    const dragRef: RefObject<TGridTrackAffordanceDragState | null> = { current: dragState };

    // before
    disarmGridTrackAffordanceDrag(canvas, event, store.dispatch, dragRef);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [
        { mode: SizingMode.fixed, value: 80 },
        { mode: SizingMode.fixed, value: 100 },
        { mode: SizingMode.fixed, value: 120 },
      ],
    });
    expect(selectGridTrackSelection(store.getState())).toBeNull();
  });

  it('should do nothing when the referenced frame no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const dragState: TGridTrackAffordanceDragState = {
      axis: 'column',
      dropIndex: 2,
      frameId: 'missing',
      ghostPosition: { x: 0, y: 0 },
      hasMoved: true,
      sourceIndices: [0],
    };
    const dragRef: RefObject<TGridTrackAffordanceDragState | null> = { current: dragState };

    // before
    disarmGridTrackAffordanceDrag(canvas, event, store.dispatch, dragRef);

    // result
    expect(dragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(7);
  });
});
