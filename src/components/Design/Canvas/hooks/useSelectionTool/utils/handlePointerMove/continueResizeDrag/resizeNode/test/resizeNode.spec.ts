// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { resizeNode } from '../resizeNode';

const addLineNode = (x1: number, y1: number, x2: number, y2: number): string => {
  store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1, x2, y1, y2 }));

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 50, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 100, x: 0, y: 0 }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 2, y: 4 } } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 10 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('resizeNode', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should route a line origin to the line resize path', () => {
    // mock
    const idLine = addLineNode(20, 20, 80, 80);

    // before
    resizeNode(idLine, { x1: 20, x2: 80, y1: 20, y2: 80 }, store.dispatch, { x: 0, y: 0 }, 2, 2, false, null);

    // result
    expect(store.getState().design.nodes[idLine]).toMatchObject({ x1: 40, x2: 160, y1: 40, y2: 160 });
  });

  it('should route a box origin to the box resize path', () => {
    // mock
    const idA = addFrameNode();

    // before
    resizeNode(idA, { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 }, store.dispatch, { x: 0, y: 0 }, 1.5, 1.6, true, null);

    // result
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 80, width: 150, x: 0, y: 0 });
  });

  it('should route a vector origin to the vector resize path', () => {
    // mock
    const idVector = addVectorNode();
    const origin = {
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 2, y: 4 } } },
      vertices: { v1: { x: 0, y: 0 }, v2: { x: 10, y: 10 } },
    };

    // before
    resizeNode(idVector, origin, store.dispatch, { x: 0, y: 0 }, 2, 3, false, null);

    // result
    const node = store.getState().design.nodes[idVector];

    expect(node).toMatchObject({
      segments: { s1: { tangentStart: { x: 4, y: 12 } } },
      vertices: { v1: { x: 0, y: 0 }, v2: { x: 20, y: 30 } },
    });
  });
});
