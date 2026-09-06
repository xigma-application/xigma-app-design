// store
import { addNode, deleteNode, moveNodes } from 'store/design/slice';
import { selectActivePage, selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { rotateNodesRigidly } from '../rotateNodesRigidly';

const addFrameNode = (): TFrameNode => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ffffff',
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

  const { rootOrder, nodes } = selectActivePage(store.getState());

  return nodes[rootOrder[rootOrder.length - 1]] as TFrameNode;
};

const addRectangleNode = (parentId: string | null): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 10, name: 'Rectangle', parentId, rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('rotateNodesRigidly', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should do nothing when the target rotation matches the frame’s current one', () => {
    // mock
    const frame = addFrameNode();
    const childId = addRectangleNode(frame.id);

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: frame.id }));

    // action
    rotateNodesRigidly(store.dispatch, frame, frame.rotation);

    // result — the child never moved
    expect(selectNodes(store.getState())[childId]).toMatchObject({ rotation: 0, x: 0, y: 0 });
  });

  it('should rigidly rotate the frame and its child around the frame’s own centre', () => {
    // mock
    const staleFrame = addFrameNode();
    const childId = addRectangleNode(staleFrame.id);

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: staleFrame.id }));

    const frame = selectNodes(store.getState())[staleFrame.id] as TFrameNode;

    // action
    rotateNodesRigidly(store.dispatch, frame, 90);

    // result
    const child = selectNodes(store.getState())[childId] as TRectangleNode;

    expect(selectNodes(store.getState())[frame.id]).toMatchObject({ rotation: 90, x: 0, y: 0 });
    expect(child).toMatchObject({ rotation: 90, x: 10, y: 0 });
  });
});
