// utils
import { getVectorHandlePoint } from '../getVectorHandlePoint';
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';

const curve = makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 100, y: 0 }, c: { x: 100, y: 100 } }, [
  ['a', 'b'],
  ['b', 'c'],
]);

curve.segments.s0 = { ...curve.segments.s0, tangentEnd: { x: -20, y: 10 }, tangentStart: { x: 30, y: -40 } };

describe('getVectorHandlePoint', () => {
  it('should return where the end of a handle is on the canvas', () => {
    // result
    expect(getVectorHandlePoint(curve, { end: 'start', segmentId: 's0' })).toEqual({ x: 30, y: -40 });
    expect(getVectorHandlePoint(curve, { end: 'end', segmentId: 's0' })).toEqual({ x: 80, y: 10 });
  });
});
