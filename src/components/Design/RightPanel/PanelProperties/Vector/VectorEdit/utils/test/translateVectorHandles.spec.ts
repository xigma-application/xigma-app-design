// store
import { addNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';
import { translateVectorHandles } from '../translateVectorHandles';

const curve = makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 100, y: 0 }, c: { x: 100, y: 100 } }, [
  ['a', 'b'],
  ['b', 'c'],
]);

curve.segments.s0 = { ...curve.segments.s0, tangentEnd: { x: -20, y: 10 }, tangentStart: { x: 30, y: -40 } };

const readSegments = (id: string): TVectorNode['segments'] => (selectActivePage(store.getState()).nodes[id] as TVectorNode).segments;

describe('translateVectorHandles', () => {
  it('should move the end of the handle by the delta', () => {
    // mock
    const vector = { ...curve, id: 'handle-vector' };

    store.dispatch(addNodes({ nodes: [vector], rootIds: [vector.id] }));

    // before
    translateVectorHandles(store.dispatch, vector, [{ end: 'start', segmentId: 's0' }], { x: 20, y: 0 });

    // result
    expect(readSegments(vector.id).s0.tangentStart).toEqual({ x: 50, y: -40 });
  });

  it('should turn the opposite handle of a point with mirrored handles', () => {
    // mock
    const mirrored = {
      ...curve,
      id: 'mirrored-vector',
      segments: { ...curve.segments, s1: { ...curve.segments.s1, tangentStart: { x: 20, y: -10 } } },
      vertexHandleModes: { b: 'symmetric' as const },
    };

    store.dispatch(addNodes({ nodes: [mirrored], rootIds: [mirrored.id] }));

    // before
    translateVectorHandles(store.dispatch, mirrored, [{ end: 'end', segmentId: 's0' }], { x: 0, y: 20 });

    // result
    const segments = readSegments(mirrored.id);

    expect(segments.s0.tangentEnd).toEqual({ x: -20, y: 30 });
    expect(segments.s1.tangentStart?.x).toBeCloseTo(20);
    expect(segments.s1.tangentStart?.y).toBeCloseTo(-30);
  });
});
