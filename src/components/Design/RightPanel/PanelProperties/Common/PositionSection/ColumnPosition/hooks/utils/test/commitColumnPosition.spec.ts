// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { commitColumnPosition } from '../commitColumnPosition';

const addFrame = (x: number, y: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): { x: number; y: number } => {
  const node = selectActivePage(store.getState()).nodes[id] as { x: number; y: number };

  return { x: node.x, y: node.y };
};

describe('commitColumnPosition', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should write the raw values when there is no parent', () => {
    const id = addFrame(0, 0);

    commitColumnPosition(store.dispatch, id, undefined, 33, 44);

    expect(readNode(id)).toEqual({ x: 33, y: 44 });
  });

  it('should offset by the parent origin when a parent is given', () => {
    const parentId = addFrame(100, 50);

    store.dispatch(updateNode({ changes: { height: 300, width: 400 }, id: parentId }));

    const childId = addFrame(0, 0);

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));

    const parent = selectActivePage(store.getState()).nodes[parentId] as Parameters<typeof commitColumnPosition>[2];

    commitColumnPosition(store.dispatch, childId, parent, 10, 20);

    expect(readNode(childId)).toEqual({ x: 110, y: 70 });
  });
});
