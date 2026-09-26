// store
import { addNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';
import { translateVectorPointGroups } from '../translateVectorPointGroups';

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

describe('translateVectorPointGroups', () => {
  it('should move the points of each group by the delta of that group and keep the other points and vectors', () => {
    // mock
    const vector = { ...twoSquares, id: 'groups-vector' };

    store.dispatch(addNodes({ nodes: [vector], rootIds: ['groups-vector'] }));

    // before
    translateVectorPointGroups(
      store.dispatch,
      [vector, { ...vector, id: 'other-vector' }],
      [
        { nodeId: 'groups-vector', rect: { height: 0, width: 0, x: 0, y: 0 }, vertexIds: ['a1'] },
        { nodeId: 'groups-vector', rect: { height: 0, width: 0, x: 30, y: 20 }, vertexIds: ['b1', 'b2'] },
      ],
      [
        { x: 1, y: 2 },
        { x: -30, y: 0 },
      ],
    );

    // result
    const { vertices } = selectActivePage(store.getState()).nodes['groups-vector'] as TVectorNode;

    expect(vertices.a1).toEqual({ id: 'a1', x: 1, y: 2 });
    expect(vertices.b1).toEqual({ id: 'b1', x: 0, y: 20 });
    expect(vertices.b2).toEqual({ id: 'b2', x: 20, y: 20 });
    expect(vertices.b3).toEqual({ id: 'b3', x: 50, y: 40 });
    expect(selectActivePage(store.getState()).nodes['other-vector']).toBeUndefined();
  });
});
