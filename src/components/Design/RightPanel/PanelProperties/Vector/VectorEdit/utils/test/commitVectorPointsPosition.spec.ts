// store
import { addNode, addNodes, moveNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { commitVectorPointsPosition } from '../commitVectorPointsPosition';
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';

const twoSquares = makeNetworkVector(
  {
    a1: { x: 0, y: 0 },
    a2: { x: 10, y: 0 },
    a3: { x: 10, y: 10 },
    a4: { x: 0, y: 10 },
    b1: { x: 30, y: 20 },
    b2: { x: 50, y: 20 },
    b3: { x: 50, y: 40 },
    b4: { x: 30, y: 40 },
  },
  [
    ['a1', 'a2'],
    ['a2', 'a3'],
    ['a3', 'a4'],
    ['a4', 'a1'],
    ['b1', 'b2'],
    ['b2', 'b3'],
    ['b3', 'b4'],
    ['b4', 'b1'],
  ],
);

const readVertices = (id: string): TVectorNode['vertices'] => (selectActivePage(store.getState()).nodes[id] as TVectorNode).vertices;

describe('commitVectorPointsPosition', () => {
  it('should move the given points together so their top left corner lands on the new value', () => {
    // mock
    store.dispatch(addNodes({ nodes: [{ ...twoSquares, id: 'points-vector' }], rootIds: ['points-vector'] }));

    // before
    commitVectorPointsPosition(store.dispatch, 'points-vector', ['b1', 'b2'], 'x', 100);

    // result
    const vertices = readVertices('points-vector');

    expect(vertices.b1).toEqual({ id: 'b1', x: 100, y: 20 });
    expect(vertices.b2).toEqual({ id: 'b2', x: 120, y: 20 });
    expect(vertices.b3).toEqual({ id: 'b3', x: 50, y: 40 });
  });

  it('should read the new value relative to the parent frame', () => {
    // mock
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fills: [],
        height: 200,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 200,
        x: -10,
        y: -10,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const frameId = rootOrder[rootOrder.length - 1];

    store.dispatch(addNodes({ nodes: [{ ...twoSquares, id: 'framed-vector' }], rootIds: ['framed-vector'] }));
    store.dispatch(moveNodes({ nodeIds: ['framed-vector'], targetIndex: 0, targetParentId: frameId }));

    // before
    commitVectorPointsPosition(store.dispatch, 'framed-vector', ['a1'], 'y', 30);

    // result
    expect(readVertices('framed-vector').a1).toEqual({ id: 'a1', x: 0, y: 20 });
  });
});
