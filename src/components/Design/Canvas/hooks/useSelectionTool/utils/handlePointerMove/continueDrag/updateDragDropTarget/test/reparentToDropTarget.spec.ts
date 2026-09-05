// store
import { addNode, deleteNode, moveNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { reparentToDropTarget } from '../reparentToDropTarget';

const addFrame = (x: number, y: number, size: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      height: size,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: size,
      x,
      y,
    }),
  );

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

const addRect = (x: number, y: number): string => {
  store.dispatch(
    addNode({ fill: '#000', height: 20, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x, y }),
  );

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

describe('reparentToDropTarget', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should move the dragged nodes into the target frame, appending them after its existing children', () => {
    // mock
    const frameId = addFrame(0, 0, 300);
    const existingChildId = addRect(0, 0);
    store.dispatch(moveNodes({ nodeIds: [existingChildId], targetIndex: 0, targetParentId: frameId }));

    const rectId = addRect(500, 500);
    const refs = createCanvasRefs();

    // action
    reparentToDropTarget(store.dispatch, store.getState(), refs, [rectId], frameId);

    // result
    const page = selectActivePage(store.getState());

    expect(page.nodes[rectId].parentId).toBe(frameId);
    expect((page.nodes[frameId] as { childIds: string[] }).childIds).toEqual([existingChildId, rectId]);
  });

  it('should move the dragged nodes back to the root, appended after the existing root order, when there is no target parent', () => {
    // mock
    const frameId = addFrame(0, 0, 100);
    const rectId = addRect(10, 10);
    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: frameId }));

    const refs = createCanvasRefs();

    // action
    reparentToDropTarget(store.dispatch, store.getState(), refs, [rectId], null);

    // result
    const page = selectActivePage(store.getState());

    expect(page.nodes[rectId].parentId).toBeNull();
    expect(page.rootOrder.at(-1)).toBe(rectId);
  });

  it('should clear any in-flight auto-layout reorder preview before dispatching the move', () => {
    // mock
    const frameId = addFrame(0, 0, 300);
    const rectId = addRect(500, 500);
    const refs = createCanvasRefs({
      transform: { autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId, positions: {} } } },
    });

    // action
    reparentToDropTarget(store.dispatch, store.getState(), refs, [rectId], frameId);

    // result
    expect(refs.transform.autoLayoutReorderPreviewRef.current).toBeNull();
  });
});
