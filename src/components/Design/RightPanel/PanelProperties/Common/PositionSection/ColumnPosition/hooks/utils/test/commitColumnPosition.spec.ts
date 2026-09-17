// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { commitColumnPosition } from '../commitColumnPosition';

const addFrame = (x: number, y: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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

  it('should carry a stored image crop along by the same delta, instead of leaving it behind', () => {
    // mock — a frame at (0,0) whose image crop starts flush with its own bounds
    const paint: TImagePaint = {
      crop: { height: 20, rotation: 0, width: 20, x: 0, y: 0 },
      opacity: 100,
      ref: 'image-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };

    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fills: [paint],
        height: 20,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 20,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const id = rootOrder[rootOrder.length - 1];

    // before
    commitColumnPosition(store.dispatch, id, undefined, 30, 40);

    // result
    const node = selectActivePage(store.getState()).nodes[id] as { fills: TImagePaint[]; x: number; y: number };

    expect(node).toMatchObject({ x: 30, y: 40 });
    expect(node.fills[0].crop).toEqual({ height: 20, rotation: 0, width: 20, x: 30, y: 40 });
  });
});
