// store
import { addNode, setVectorEditingNodeIds } from 'store/design/slice';
import { selectOrderedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getSelectionHitAtPoint } from '../getSelectionHitAtPoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const addFrameNode = (x: number, y: number, size = 100): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: size, x, y }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addClosedSquareVectorNode = (x: number, y: number, size: number): string => {
  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x, y },
        v2: { id: 'v2', x: x + size, y },
        v3: { id: 'v3', x: x + size, y: y + size },
        v4: { id: 'v4', x, y: y + size },
      },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('getSelectionHitAtPoint', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should return the hit node as-is when it is not the one currently being vector-edited', () => {
    // mock
    const idA = addFrameNode(0, 0);

    // action
    const hit = getSelectionHitAtPoint({ x: 50, y: 50 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result — a plain frame is never affected by vectorEditingNodeId
    expect(hit?.id).toBe(idA);
  });

  it('should null out a hit on the contour of the node currently open in Vector Edit Mode', () => {
    // mock — left edge of a closed 100x100 square
    const idA = addClosedSquareVectorNode(200, 200, 100);

    store.dispatch(setVectorEditingNodeIds([idA]));

    // action
    const hit = getSelectionHitAtPoint({ x: 200, y: 250 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result
    expect(hit).toBeNull();
  });

  it('should still return a hit on that same vector node when it is not the one being edited', () => {
    // mock — a point on the square's own contour, since an unfilled region only collides on its outline
    const idA = addClosedSquareVectorNode(400, 200, 100);

    // action — no setVectorEditingNodeIds dispatched
    const hit = getSelectionHitAtPoint({ x: 400, y: 250 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result
    expect(hit?.id).toBe(idA);
  });

  it('should return null when nothing is hit at all, regardless of vector editing state', () => {
    // action
    const hit = getSelectionHitAtPoint({ x: 9000, y: 9000 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result
    expect(hit).toBeNull();
  });
});
