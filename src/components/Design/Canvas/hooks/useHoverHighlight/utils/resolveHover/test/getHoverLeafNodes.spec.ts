// store
import { addNode, moveNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getHoverLeafNodes } from '../getHoverLeafNodes';

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
    addNode({
      fill: '#00ff00',
      height: size,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: size,
      x,
      y,
    }),
  );

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

describe('getHoverLeafNodes', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should stop at a nested frame, treating its actual (non-frame) content as unreachable, when Ctrl is not held', () => {
    // mock — outer > nested > rect, the rect is the actual content sitting inside the opaque nested frame
    const outerId = addFrameNode(0, 0, 400);
    const nestedId = addFrameNode(20, 20, 200);
    const rectId = addRectNode(40, 40, 40);

    store.dispatch(moveNodes({ nodeIds: [nestedId], targetIndex: 0, targetParentId: outerId }));
    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: nestedId }));

    const state = store.getState();
    const leafNodes = getHoverLeafNodes(state, selectActivePage(state).nodes, false);

    // result — the nested frame itself is a candidate, its own (non-frame) content is not
    expect(leafNodes.map((node) => node.id)).toContain(nestedId);
    expect(leafNodes.map((node) => node.id)).not.toContain(rectId);
  });

  it('should keep every frame in a deeper nesting chain individually reachable when Ctrl is not held', () => {
    // mock — outer > mid > deeper, three frame levels — each one stays its own selectable unit
    const outerId = addFrameNode(500, 0, 400);
    const midId = addFrameNode(520, 20, 200);
    const deeperId = addFrameNode(540, 40, 40);

    store.dispatch(moveNodes({ nodeIds: [midId], targetIndex: 0, targetParentId: outerId }));
    store.dispatch(moveNodes({ nodeIds: [deeperId], targetIndex: 0, targetParentId: midId }));

    const state = store.getState();
    const leafNodes = getHoverLeafNodes(state, selectActivePage(state).nodes, false);

    expect(leafNodes.map((node) => node.id)).toContain(midId);
    expect(leafNodes.map((node) => node.id)).toContain(deeperId);
    expect(leafNodes.map((node) => node.id)).not.toContain(outerId);
  });

  it('should reach straight through every nested frame level to the deepest actual leaf when Ctrl is held', () => {
    // mock — same structure, but Ctrl bypasses both frame boundaries
    const outerId = addFrameNode(100, 0, 400);
    const nestedId = addFrameNode(120, 20, 200);
    const childId = addFrameNode(140, 40, 40);

    store.dispatch(moveNodes({ nodeIds: [nestedId], targetIndex: 0, targetParentId: outerId }));
    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: nestedId }));

    const state = store.getState();
    const leafNodes = getHoverLeafNodes(state, selectActivePage(state).nodes, true);

    // result — the deepest child is directly reachable, the frames in between are not candidates
    expect(leafNodes.map((node) => node.id)).toContain(childId);
    expect(leafNodes.map((node) => node.id)).not.toContain(nestedId);
    expect(leafNodes.map((node) => node.id)).not.toContain(outerId);
  });
});
