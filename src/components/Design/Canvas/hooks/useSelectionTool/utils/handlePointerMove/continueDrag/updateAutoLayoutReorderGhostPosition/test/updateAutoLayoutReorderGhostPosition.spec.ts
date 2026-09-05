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
