// utils
import { getVectorHandleVertexId } from '../getVectorHandleVertexId';
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';

const curve = makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 100, y: 0 }, c: { x: 100, y: 100 } }, [
  ['a', 'b'],
  ['b', 'c'],
]);

curve.segments.s0 = { ...curve.segments.s0, tangentEnd: { x: -20, y: 10 }, tangentStart: { x: 30, y: -40 } };

describe('getVectorHandleVertexId', () => {
  it('should return the point a handle comes out of', () => {
    // result
    expect(getVectorHandleVertexId(curve, { end: 'start', segmentId: 's0' })).toBe('a');
    expect(getVectorHandleVertexId(curve, { end: 'end', segmentId: 's0' })).toBe('b');
  });
});
