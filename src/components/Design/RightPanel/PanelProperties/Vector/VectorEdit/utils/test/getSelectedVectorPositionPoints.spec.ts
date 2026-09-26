// utils
import { getSelectedVectorPositionPoints } from '../getSelectedVectorPositionPoints';
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';

const curve = makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 100, y: 0 }, c: { x: 100, y: 100 } }, [
  ['a', 'b'],
  ['b', 'c'],
]);

curve.segments.s0 = { ...curve.segments.s0, tangentEnd: { x: -20, y: 10 }, tangentStart: { x: 30, y: -40 } };

describe('getSelectedVectorPositionPoints', () => {
  it('should return the selected points', () => {
    // result
    expect(getSelectedVectorPositionPoints(curve, ['c'], [{ end: 'start', segmentId: 's0' }])).toEqual([curve.vertices.c]);
  });

  it('should return the ends of the selected handles without selected points', () => {
    // result
    expect(getSelectedVectorPositionPoints(curve, [], [{ end: 'start', segmentId: 's0' }])).toEqual([{ x: 30, y: -40 }]);
  });
});
