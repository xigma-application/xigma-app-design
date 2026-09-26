// store
import { addNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';
import { translateVectorPoints } from '../translateVectorPoints';

const curve = makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 100, y: 0 }, c: { x: 100, y: 100 } }, [
  ['a', 'b'],
  ['b', 'c'],
]);

curve.segments.s0 = { ...curve.segments.s0, tangentEnd: { x: -20, y: 10 }, tangentStart: { x: 30, y: -40 } };

describe('translateVectorPoints', () => {
  it('should move only the given points by the delta', () => {
    // mock
    const vector = { ...curve, id: 'points-vector' };

    store.dispatch(addNodes({ nodes: [vector], rootIds: [vector.id] }));

    // before
    translateVectorPoints(store.dispatch, vector, ['b', 'c'], { x: 5, y: -5 });

    // result
    const { vertices } = selectActivePage(store.getState()).nodes[vector.id] as TVectorNode;

    expect(vertices).toEqual({ a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 105, y: -5 }, c: { id: 'c', x: 105, y: 95 } });
  });
});
