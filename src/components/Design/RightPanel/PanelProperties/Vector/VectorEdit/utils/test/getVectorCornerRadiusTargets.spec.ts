// utils
import { getVectorCornerRadiusTargets } from '../getVectorCornerRadiusTargets';
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';

const curve = makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 100, y: 0 }, c: { x: 100, y: 100 } }, [
  ['a', 'b'],
  ['b', 'c'],
]);

curve.segments.s0 = { ...curve.segments.s0, tangentEnd: { x: -20, y: 10 }, tangentStart: { x: 30, y: -40 } };

describe('getVectorCornerRadiusTargets', () => {
  it('should keep only the vectors with selected points while any point is selected', () => {
    // mock
    const withPoints = { handles: [], node: curve, pointIds: ['a'], vertexIds: ['a'] };
    const withoutPoints = { handles: [], node: { ...curve, id: 'other' }, pointIds: [], vertexIds: [] };

    // result
    expect(getVectorCornerRadiusTargets([withPoints, withoutPoints])).toEqual([withPoints]);
  });

  it('should target every vector as a whole while no point is selected', () => {
    // mock
    const handleOnly = { handles: [], node: curve, pointIds: [], vertexIds: [] };

    // result
    expect(getVectorCornerRadiusTargets([handleOnly, { ...handleOnly, node: { ...curve, id: 'other' } }])).toHaveLength(2);
  });
});
