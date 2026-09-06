// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDragState } from 'types/design/selectionTool/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';
import { updateAutoLayoutReorderGhostPosition } from '../updateAutoLayoutReorderGhostPosition';

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#fff',
  height: 20,
  id: 'r1',
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 10,
  y: 20,
  ...overrides,
});

const dragState = (nodeOrigins: TDragState['nodeOrigins']): TDragState =>
  ({ dispatchThrottle: { frameId: null, run: null }, nodeOrigins }) as unknown as TDragState;

const addRect = (x: number, y: number): string => {
  store.dispatch(
    addNode({ fill: '#000', height: 20, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('updateAutoLayoutReorderGhostPosition', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should write the dragged node’s cursor-tracked position into the preview ref, without dispatching a node update', () => {
    // mock
    const refs = createCanvasRefs({
      transform: { autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId: 'frame-1', positions: {} } } },
    });
    const node = rect();
    const state = dragState({ r1: { x: 10, y: 20 } });

    // action
    updateAutoLayoutReorderGhostPosition(refs, [node], store.dispatch, state, null, 5, -3);
    flushThrottledDispatch(state.dispatchThrottle);

    // result
    expect(refs.transform.autoLayoutReorderPreviewRef.current).toEqual({
      activeIndex: 0,
      frameId: 'frame-1',
      positions: { r1: { x: 15, y: 17 } },
    });
    expect(state.dispatchThrottle.run).toBeNull();
  });

  it('should preserve existing sibling entries already in the ref’s positions map', () => {
    // mock
    const refs = createCanvasRefs({
      transform: {
        autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId: 'frame-1', positions: { sibling: { x: 1, y: 1 } } } },
      },
    });
    const node = rect();
    const state = dragState({ r1: { x: 10, y: 20 } });

    // action
    updateAutoLayoutReorderGhostPosition(refs, [node], store.dispatch, state, null, 0, 0);

    // result
    expect(refs.transform.autoLayoutReorderPreviewRef.current?.positions).toEqual({
      r1: { x: 10, y: 20 },
      sibling: { x: 1, y: 1 },
    });
  });

  it('should fall back to dispatching the drag delta when no reorder preview is active', () => {
    // mock
    const refs = createCanvasRefs();
    const id = addRect(100, 100);
    const node = rect({ id });
    const state = dragState({ [id]: { x: 100, y: 100 } });

    // action
    updateAutoLayoutReorderGhostPosition(refs, [node], store.dispatch, state, null, 5, 5);
    flushThrottledDispatch(state.dispatchThrottle);

    // result
    expect(refs.transform.autoLayoutReorderPreviewRef.current).toBeNull();
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[id]).toMatchObject({ x: 105, y: 105 });
  });

  it('places companions at their own footprint slot while the grabbed member tracks the cursor', () => {
    // mock — block {c,d}; footprint slots are row-3 left/right; grabbed 'c' dragged onto its own slot
    const refs = createCanvasRefs({
      transform: {
        autoLayoutReorderPreviewRef: {
          current: {
            activeIndex: 4,
            draggedGrabbedId: 'c',
            draggedMemberSlots: { c: { x: 0, y: 200 }, d: { x: 100, y: 200 } },
            frameId: 'frame-1',
            positions: {},
          },
        },
      },
    });
    const nodeC = rect({ id: 'c', x: 0, y: 100 });
    const nodeD = rect({ id: 'd', x: 100, y: 100 });
    const state = dragState({ c: { x: 0, y: 100 }, d: { x: 100, y: 100 } });

    // action — delta carries 'c' down onto row 3 left (its own footprint slot)
    updateAutoLayoutReorderGhostPosition(refs, [nodeC, nodeD], store.dispatch, state, null, 0, 100);

    // result — 'c' rides the cursor, 'd' sits in its own footprint slot
    expect(refs.transform.autoLayoutReorderPreviewRef.current?.positions).toEqual({
      c: { x: 0, y: 200 },
      d: { x: 100, y: 200 },
    });
  });

  it('keeps the whole block riding the cursor between slots, not pinned to the grid', () => {
    // mock — same block {c,d}
    const refs = createCanvasRefs({
      transform: {
        autoLayoutReorderPreviewRef: {
          current: {
            activeIndex: 4,
            draggedGrabbedId: 'c',
            draggedMemberSlots: { c: { x: 0, y: 200 }, d: { x: 100, y: 200 } },
            frameId: 'frame-1',
            positions: {},
          },
        },
      },
    });
    const nodeC = rect({ id: 'c', x: 0, y: 100 });
    const nodeD = rect({ id: 'd', x: 100, y: 100 });
    const state = dragState({ c: { x: 0, y: 100 }, d: { x: 100, y: 100 } });

    // action — 10px past 'c'’s own footprint slot, still nearest to it
    updateAutoLayoutReorderGhostPosition(refs, [nodeC, nodeD], store.dispatch, state, null, 10, 100);

    // result — both members carry the same +10 the cursor moved; the pair is not snapped to the cell
    expect(refs.transform.autoLayoutReorderPreviewRef.current?.positions).toEqual({
      c: { x: 10, y: 200 },
      d: { x: 110, y: 200 },
    });
  });

  it('swaps a companion into the grabbed member’s vacated slot when the cursor is over the companion’s slot', () => {
    // mock — same block {c,d}; this time the grabbed 'c' is dragged onto 'd'’s footprint slot
    const refs = createCanvasRefs({
      transform: {
        autoLayoutReorderPreviewRef: {
          current: {
            activeIndex: 4,
            draggedGrabbedId: 'c',
            draggedMemberSlots: { c: { x: 0, y: 200 }, d: { x: 100, y: 200 } },
            frameId: 'frame-1',
            positions: {},
          },
        },
      },
    });
    const nodeC = rect({ id: 'c', x: 0, y: 100 });
    const nodeD = rect({ id: 'd', x: 100, y: 100 });
    const state = dragState({ c: { x: 0, y: 100 }, d: { x: 100, y: 100 } });

    // action — delta carries 'c' onto row 3 right (which is 'd'’s footprint slot)
    updateAutoLayoutReorderGhostPosition(refs, [nodeC, nodeD], store.dispatch, state, null, 100, 100);

    // result — 'c' rides the cursor onto the right cell; 'd' jumps left into 'c'’s vacated slot
    expect(refs.transform.autoLayoutReorderPreviewRef.current?.positions).toEqual({
      c: { x: 100, y: 200 },
      d: { x: 0, y: 200 },
    });
  });

  it('clamps the grabbed ghost to the frame content box so a companion flung into the chasm cannot leave the frame', () => {
    // mock — footprint slots are near the frame's bottom; the frame's content box is 200x300
    const refs = createCanvasRefs({
      transform: {
        autoLayoutReorderPreviewRef: {
          current: {
            activeIndex: 4,
            draggedClampBox: { height: 300, width: 200, x: 0, y: 0 },
            draggedGrabbedId: 'c',
            draggedMemberSlots: { c: { x: 0, y: 200 }, d: { x: 100, y: 200 } },
            frameId: 'frame-1',
            positions: {},
          },
        },
      },
    });
    const nodeC = rect({ id: 'c', x: 0, y: 100 });
    const nodeD = rect({ id: 'd', x: 100, y: 100 });
    const state = dragState({ c: { x: 0, y: 100 }, d: { x: 100, y: 100 } });

    // action — a huge delta drags grabbed 'c' way past the last slot, into the dead space
    updateAutoLayoutReorderGhostPosition(refs, [nodeC, nodeD], store.dispatch, state, null, 500, 500);

    // result — 'c' pins to the box's far corner (200-20 / 300-20), 'd' rides alongside it, both inside
    expect(refs.transform.autoLayoutReorderPreviewRef.current?.positions).toEqual({
      c: { x: 180, y: 280 },
      d: { x: 80, y: 280 },
    });
  });

  it('falls back to cursor-tracking for a selected node with no recorded footprint slot', () => {
    // mock — 'x' is selected but absent from draggedMemberSlots
    const refs = createCanvasRefs({
      transform: {
        autoLayoutReorderPreviewRef: {
          current: {
            activeIndex: 4,
            draggedGrabbedId: 'c',
            draggedMemberSlots: { c: { x: 0, y: 200 }, d: { x: 100, y: 200 } },
            frameId: 'frame-1',
            positions: {},
          },
        },
      },
    });
    const nodeC = rect({ id: 'c', x: 0, y: 100 });
    const nodeD = rect({ id: 'd', x: 100, y: 100 });
    const nodeX = rect({ id: 'x', x: 300, y: 300 });
    const state = dragState({ c: { x: 0, y: 100 }, d: { x: 100, y: 100 }, x: { x: 300, y: 300 } });

    // action
    updateAutoLayoutReorderGhostPosition(refs, [nodeC, nodeD, nodeX], store.dispatch, state, null, 5, 5);

    // result — 'x' just tracks the raw drag delta
    expect(refs.transform.autoLayoutReorderPreviewRef.current?.positions.x).toEqual({ x: 305, y: 305 });
  });

  it('tracks the cursor for the whole block when the grabbed member is not among the selected nodes', () => {
    // mock — draggedGrabbedId points at an id that is not in the selection
    const refs = createCanvasRefs({
      transform: {
        autoLayoutReorderPreviewRef: {
          current: {
            activeIndex: 4,
            draggedGrabbedId: 'gone',
            draggedMemberSlots: { c: { x: 0, y: 200 }, d: { x: 100, y: 200 } },
            frameId: 'frame-1',
            positions: {},
          },
        },
      },
    });
    const nodeC = rect({ id: 'c', x: 0, y: 100 });
    const nodeD = rect({ id: 'd', x: 100, y: 100 });
    const state = dragState({ c: { x: 0, y: 100 }, d: { x: 100, y: 100 } });

    // action
    updateAutoLayoutReorderGhostPosition(refs, [nodeC, nodeD], store.dispatch, state, null, 5, 5);

    // result — no swap logic, every member just tracks the delta
    expect(refs.transform.autoLayoutReorderPreviewRef.current?.positions).toEqual({
      c: { x: 5, y: 105 },
      d: { x: 105, y: 105 },
    });
  });

  it('should write every dragged node’s cursor-tracked position into the preview ref, for a multi-node selection', () => {
    // mock
    const refs = createCanvasRefs({
      transform: { autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId: 'frame-1', positions: {} } } },
    });
    const nodeA = rect({ id: 'a', x: 10, y: 20 });
    const nodeB = rect({ id: 'b', x: 30, y: 40 });
    const state = dragState({ a: { x: 10, y: 20 }, b: { x: 30, y: 40 } });

    // action
    updateAutoLayoutReorderGhostPosition(refs, [nodeA, nodeB], store.dispatch, state, null, 5, 5);
    flushThrottledDispatch(state.dispatchThrottle);

    // result — both dragged nodes get a ghost position, not just the first one
    expect(refs.transform.autoLayoutReorderPreviewRef.current?.positions).toEqual({
      a: { x: 15, y: 25 },
      b: { x: 35, y: 45 },
    });
    expect(state.dispatchThrottle.run).toBeNull();
  });
});
