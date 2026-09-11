import { RefObject } from 'react';

// store
import { addNode, deleteNode, setViewport } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';

// utils
import { continueGridTrackAffordanceDrag } from '../continueGridTrackAffordanceDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const addFrame = (rotation = 0): string => {
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
      gridRowCount: 2,
      gridRowSizes: [
        { mode: SizingMode.fixed, value: 60 },
        { mode: SizingMode.fixed, value: 90 },
      ],
      height: 200,
      horizontalGap: 0,
      layoutMode: LayoutMode.grid,
      name: 'Frame',
      parentId: null,
      rotation,
      type: NodeType.frame,
      verticalGap: 0,
      width: 300,
      x: 0,
      y: 0,
    }),
  );

  return selectActivePage(store.getState()).rootOrder.slice(-1)[0];
};

const baseDragState = (overrides: Partial<TGridTrackAffordanceDragState> = {}): TGridTrackAffordanceDragState => ({
  axis: 'column',
  dropIndex: 0,
  frameId: overrides.frameId ?? 'missing',
  ghostPosition: { x: 0, y: 0 },
  hasMoved: false,
  sourceIndices: [0],
  ...overrides,
});

describe('continueGridTrackAffordanceDrag', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should do nothing when no grid track drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const dragRef: RefObject<TGridTrackAffordanceDragState | null> = { current: null };

    // before
    continueGridTrackAffordanceDrag(canvas, pointerEvent(10, 10), dragRef);

    // result
    expect(selectActivePage(store.getState()).nodes).toEqual({});
  });

  it('should track the column-axis drop index and move the ghost along the pointer’s x position, without touching the store', () => {
    // mock
    const frameId = addFrame();
    const canvas = createCanvas();
    const dragState = baseDragState({ frameId });
    const dragRef: RefObject<TGridTrackAffordanceDragState | null> = { current: dragState };

    // before — pointer past every column’s midpoint (frame-local x 300)
    continueGridTrackAffordanceDrag(canvas, pointerEvent(300, 100), dragRef);

    // result — nothing but the local drag state (and the drawn ghost, which reads it) changes
    expect(dragState.hasMoved).toBe(true);
    expect(dragState.dropIndex).toBe(3);
    expect(dragState.ghostPosition.x).toBe(300);
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({
      gridColumnSizes: [
        { mode: SizingMode.fixed, value: 80 },
        { mode: SizingMode.fixed, value: 100 },
        { mode: SizingMode.fixed, value: 120 },
      ],
    });
  });

  it('should track the row-axis drop index and move the ghost along the pointer’s y position', () => {
    // mock
    const frameId = addFrame();
    const canvas = createCanvas();
    const dragState = baseDragState({ axis: 'row', frameId });
    const dragRef: RefObject<TGridTrackAffordanceDragState | null> = { current: dragState };

    // before — pointer past both rows’ midpoints (frame-local y 200)
    continueGridTrackAffordanceDrag(canvas, pointerEvent(10, 200), dragRef);

    // result
    expect(dragState.dropIndex).toBe(2);
    expect(dragState.ghostPosition.y).toBe(200);
  });

  it('should ignore the cross-axis pointer coordinate — the ghost stays locked to the drag’s own axis', () => {
    // mock
    const frameId = addFrame();
    const canvas = createCanvas();
    const dragState = baseDragState({ frameId });
    const dragRef: RefObject<TGridTrackAffordanceDragState | null> = { current: dragState };

    // before — pointer at x 20 (inside track 0) but wildly off in y; drop index and the ghost's y
    // (pinned at the pill's own offset line) must both ignore it
    continueGridTrackAffordanceDrag(canvas, pointerEvent(20, 5000), dragRef);

    // result
    expect(dragState.dropIndex).toBe(0);
    expect(dragState.ghostPosition.y).not.toBe(5000);
  });

  it('should do nothing when the referenced frame no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const dragState = baseDragState();
    const dragRef: RefObject<TGridTrackAffordanceDragState | null> = { current: dragState };

    // before
    continueGridTrackAffordanceDrag(canvas, pointerEvent(300, 100), dragRef);

    // result
    expect(dragState.hasMoved).toBe(false);
  });
});
