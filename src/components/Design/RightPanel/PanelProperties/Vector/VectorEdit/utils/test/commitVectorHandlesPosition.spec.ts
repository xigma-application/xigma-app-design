// store
import { addNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { commitVectorHandlesPosition } from '../commitVectorHandlesPosition';
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';

const curve = makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 100, y: 0 }, c: { x: 100, y: 100 } }, [
  ['a', 'b'],
  ['b', 'c'],
]);

curve.segments.s0 = { ...curve.segments.s0, tangentEnd: { x: -20, y: 10 }, tangentStart: { x: 30, y: -40 } };

const readSegments = (id: string): TVectorNode['segments'] => (selectActivePage(store.getState()).nodes[id] as TVectorNode).segments;

describe('commitVectorHandlesPosition', () => {
  it('should move the end of the handle to the new value', () => {
    // mock
    store.dispatch(addNodes({ nodes: [{ ...curve, id: 'handle-vector' }], rootIds: ['handle-vector'] }));

    // before
    commitVectorHandlesPosition(store.dispatch, 'handle-vector', [{ end: 'start', segmentId: 's0' }], 'x', 50);

    // result
    expect(readSegments('handle-vector').s0.tangentStart).toEqual({ x: 50, y: -40 });
  });

  it('should turn the opposite handle of a point with mirrored handles', () => {
    // mock
    const mirrored = {
      ...curve,
      id: 'mirrored-vector',
      segments: { ...curve.segments, s1: { ...curve.segments.s1, tangentStart: { x: 20, y: -10 } } },
      vertexHandleModes: { b: 'symmetric' as const },
    };

    store.dispatch(addNodes({ nodes: [mirrored], rootIds: ['mirrored-vector'] }));

    // before
    commitVectorHandlesPosition(store.dispatch, 'mirrored-vector', [{ end: 'end', segmentId: 's0' }], 'y', 30);

    // result
    const segments = readSegments('mirrored-vector');

    expect(segments.s0.tangentEnd).toEqual({ x: -20, y: 30 });
    expect(segments.s1.tangentStart?.x).toBeCloseTo(20);
    expect(segments.s1.tangentStart?.y).toBeCloseTo(-30);
  });
});
