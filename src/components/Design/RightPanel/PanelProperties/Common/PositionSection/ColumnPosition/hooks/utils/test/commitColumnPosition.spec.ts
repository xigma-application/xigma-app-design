// store
import { addNode, addNodes, groupNodes, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TVectorNode } from 'types/design/types';

// utils
import { commitColumnPosition } from '../commitColumnPosition';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

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

const addGroupOfTwo = (): { groupId: string; ids: string[] } => {
  const ids = ['group-child-a', 'group-child-b'];

  store.dispatch(
    addNodes({
      nodes: ids.map((id, index) => ({
        fills: [{ color: '#ff0000', opacity: 100, type: 'solid' as const }],
        height: 40,
        id,
        name: id,
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle as const,
        width: 40,
        x: 1000 + index * 60,
        y: 1000,
      })),
      rootIds: ids,
    }),
  );
  store.dispatch(setSelection(ids));
  store.dispatch(groupNodes());

  return { groupId: selectActivePage(store.getState()).selectedIds[0], ids };
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

  it('should move a layer without paints and ignore an id that no longer exists', () => {
    // mock
    store.dispatch(
      addNode({
        fills: [],
        flipX: false,
        flipY: false,
        height: 20,
        name: 'Ellipse',
        parentId: null,
        rotation: 0,
        type: NodeType.ellipse,
        width: 20,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const id = rootOrder[rootOrder.length - 1];

    // action
    commitColumnPosition(store.dispatch, id, undefined, 70, 80);
    commitColumnPosition(store.dispatch, 'missing-node', undefined, 70, 80);

    // result
    expect(readNode(id)).toEqual({ x: 70, y: 80 });
    expect(selectActivePage(store.getState()).nodes['missing-node']).toBeUndefined();
  });

  it('should move a vector by translating its vertices so its bounds start at the new position', () => {
    // mock
    store.dispatch(addNodes({ nodes: [makeSquareVector({ id: 'position-vector' })], rootIds: ['position-vector'] }));

    // action
    commitColumnPosition(store.dispatch, 'position-vector', undefined, 250, 300);

    // result
    const vector = selectActivePage(store.getState()).nodes['position-vector'] as TVectorNode;

    expect(getVectorNodeBounds(vector)).toEqual({ height: 100, width: 100, x: 250, y: 300 });
  });

  it('should move the children of a group along with it, since a group box follows its children', () => {
    // mock
    const { groupId, ids } = addGroupOfTwo();

    // action
    commitColumnPosition(store.dispatch, groupId, undefined, 1100, 1050);

    // result
    expect(readNode(groupId)).toEqual({ x: 1100, y: 1050 });
    expect(ids.map(readNode)).toEqual([
      { x: 1100, y: 1050 },
      { x: 1160, y: 1050 },
    ]);
  });
});
