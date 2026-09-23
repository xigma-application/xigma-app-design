// store
import { addNode, deleteNode, moveNodes, setImageEditor } from 'store/design/slice';
import { selectActivePage, selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { getLastAddedNodeId } from 'test/getLastAddedNodeId';
import { rotateNodesRigidly } from '../rotateNodesRigidly';

const addFrameNode = (): TFrameNode => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
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
    addNode({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 10,
      name: 'Rectangle',
      parentId,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    }),
  );

  return getLastAddedNodeId(store.getState());
};

describe('rotateNodesRigidly', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setImageEditor(null));
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

  it('should rotate a stored image crop along with the frame, instead of leaving it behind', () => {
    // mock — a 20x20 frame whose image crop starts flush with its own bounds, so its centre
    // coincides with the frame's own rotation pivot
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

    const { rootOrder, nodes } = selectActivePage(store.getState());
    const frame = nodes[rootOrder[rootOrder.length - 1]] as TFrameNode;

    // action
    rotateNodesRigidly(store.dispatch, frame, 90);

    // result — the crop's centre coincides with the pivot, so only its own rotation changes
    const updated = selectNodes(store.getState())[frame.id] as TFrameNode;

    expect(updated.rotation).toBe(90);
    expect((updated.fills[0] as TImagePaint).crop).toEqual({ height: 20, rotation: 90, width: 20, x: 0, y: 0 });
  });

  it("should still rotate the crop along with the frame even while that node's image editor is active in crop mode, since this path is the right panel's own rotation input, which should stay in lockstep with the frame like its X/Y and resize fields already do (unlike a canvas rotate-handle drag, which intentionally decouples them)", () => {
    // mock
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

    const { rootOrder, nodes } = selectActivePage(store.getState());
    const frame = nodes[rootOrder[rootOrder.length - 1]] as TFrameNode;

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: frame.id, paintIndex: 0 }));

    // action
    rotateNodesRigidly(store.dispatch, frame, 90);

    // result — both the frame and its crop rotated together
    const updated = selectNodes(store.getState())[frame.id] as TFrameNode;

    expect(updated.rotation).toBe(90);
    expect((updated.fills[0] as TImagePaint).crop).toEqual({ height: 20, rotation: 90, width: 20, x: 0, y: 0 });
  });
});
