// utils
import { getSelectedVectorHandles } from '../getSelectedVectorHandles';
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';

const curve = makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 100, y: 0 }, c: { x: 100, y: 100 } }, [
  ['a', 'b'],
  ['b', 'c'],
]);

curve.segments.s0 = { ...curve.segments.s0, tangentEnd: { x: -20, y: 10 }, tangentStart: { x: 30, y: -40 } };

describe('getSelectedVectorHandles', () => {
  it('should keep only the selected handles the vector still has', () => {
    // result
    expect(
      getSelectedVectorHandles(curve, {
        handles: [
          { end: 'start', segmentId: 's0' },
          { end: 'start', segmentId: 's1' },
          { end: 'end', segmentId: 's0' },
          { end: 'end', segmentId: 'gone' },
        ],
        segmentIds: [],
        vertexIds: [],
      }),
    ).toEqual([
      { end: 'start', segmentId: 's0' },
      { end: 'end', segmentId: 's0' },
    ]);
  });
});
