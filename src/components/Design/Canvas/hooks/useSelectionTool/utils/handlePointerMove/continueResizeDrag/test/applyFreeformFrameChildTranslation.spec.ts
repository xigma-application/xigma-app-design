// store
import { addNode, deleteNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { applyFreeformFrameChildTranslation } from '../applyFreeformFrameChildTranslation';

const addFrame = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ffffff',
      height: 200,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 300,
      x: 100,
      y: 100,
    }),
  );

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

const addChildRect = (frameId: string): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: 40,
      name: 'Rect',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 40,
      x: 230,
      y: 180,
    }),
  );

  const childId = selectActivePage(store.getState()).rootOrder.at(-1) as string;

  store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: frameId }));

  return childId;
};

const childRect = (id: string): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;

describe('applyFreeformFrameChildTranslation', () => {
  beforeEach(() => {
    selectActivePage(store.getState())
      .rootOrder.slice()
      .forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setSelection([]));
  });

  it('should shift the child by the same delta when the frame left edge moves', () => {
    const frameId = addFrame();
    const childId = addChildRect(frameId);
    const origin = { flip: null, height: 200, rotation: 0, width: 300, x: 100, y: 100 };

    // left handle dragged 40px left: x 100 -> 60, width 300 -> 340
    store.dispatch(updateNode({ changes: { width: 340, x: 60 }, id: frameId }));
    applyFreeformFrameChildTranslation(
      frameId,
      origin,
      { [childId]: { flip: null, height: 40, rotation: 0, width: 40, x: 230, y: 180 } },
      store.dispatch,
    );

    expect(childRect(childId).x).toBe(190);
    expect(childRect(childId).y).toBe(180);
  });

  it('should leave the child untouched when only the right edge moves', () => {
    const frameId = addFrame();
    const childId = addChildRect(frameId);
    const origin = { flip: null, height: 200, rotation: 0, width: 300, x: 100, y: 100 };

    store.dispatch(updateNode({ changes: { width: 360 }, id: frameId }));
    applyFreeformFrameChildTranslation(
      frameId,
      origin,
      { [childId]: { flip: null, height: 40, rotation: 0, width: 40, x: 230, y: 180 } },
      store.dispatch,
    );

    expect(childRect(childId).x).toBe(230);
    expect(childRect(childId).y).toBe(180);
  });

  it('should not throw when the frame id no longer resolves to a node', () => {
    expect(() =>
      applyFreeformFrameChildTranslation(
        'missing',
        { flip: null, height: 200, rotation: 0, width: 300, x: 100, y: 100 },
        { a: { flip: null, height: 40, rotation: 0, width: 40, x: 0, y: 0 } },
        store.dispatch,
      ),
    ).not.toThrow();
  });

  it('should not throw when the frame origin is a vector origin (never actually a frame)', () => {
    expect(() =>
      applyFreeformFrameChildTranslation(
        'x',
        { rotation: 0, segments: {}, vertices: {} },
        { a: { flip: null, height: 40, rotation: 0, width: 40, x: 0, y: 0 } },
        store.dispatch,
      ),
    ).not.toThrow();
  });
});
