// store
import { addNode, moveNodes, setSelection } from 'store/design/slice';
import { selectActivePage, selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getMarqueeLeafNodes } from '../getMarqueeLeafNodes';

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
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

const addRectNode = (x: number, y: number, size = 10): string => {
  store.dispatch(
    addNode({ fill: '#00ff00', height: size, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: size, x, y }),
  );

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

describe('getMarqueeLeafNodes', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should stop at a nested frame, excluding its actual (non-frame) content, when Ctrl is not held', () => {
    // mock — outer > nested > rect
    const outerId = addFrameNode(0, 0, 400);
    const nestedId = addFrameNode(20, 20, 200);
    const rectId = addRectNode(40, 40, 40);

    store.dispatch(moveNodes({ nodeIds: [nestedId], targetIndex: 0, targetParentId: outerId }));
    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: nestedId }));

    const state = store.getState();
    const leafNodes = getMarqueeLeafNodes(state, selectNodes(state), false);

    expect(leafNodes.map((node) => node.id)).toContain(nestedId);
    expect(leafNodes.map((node) => node.id)).not.toContain(rectId);
  });

  it('should reach straight through every frame boundary to the deepest actual leaf when Ctrl is held', () => {
    // mock — same structure, Ctrl bypasses both frame boundaries
    const outerId = addFrameNode(500, 0, 400);
    const nestedId = addFrameNode(520, 20, 200);
    const rectId = addRectNode(540, 40, 40);

    store.dispatch(moveNodes({ nodeIds: [nestedId], targetIndex: 0, targetParentId: outerId }));
    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: nestedId }));

    const state = store.getState();
    const leafNodes = getMarqueeLeafNodes(state, selectNodes(state), true);

    expect(leafNodes.map((node) => node.id)).toContain(rectId);
    expect(leafNodes.map((node) => node.id)).not.toContain(nestedId);
    expect(leafNodes.map((node) => node.id)).not.toContain(outerId);
  });
});
