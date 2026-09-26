// utils
import { getSelectedVectorPointsEntries } from '../getSelectedVectorPointsEntries';
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';

const curve = makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 100, y: 0 }, c: { x: 100, y: 100 } }, [
  ['a', 'b'],
  ['b', 'c'],
]);

curve.segments.s0 = { ...curve.segments.s0, tangentEnd: { x: -20, y: 10 }, tangentStart: { x: 30, y: -40 } };

const other = { ...curve, id: 'other' };

describe('getSelectedVectorPointsEntries', () => {
  it('should give every vector its selected points and drop the handles while any point is selected', () => {
    // before
    const entries = getSelectedVectorPointsEntries([curve, other], {
      handles: [{ end: 'start', segmentId: 's0' }],
      segmentIds: [],
      vertexIds: ['c'],
    });

    // result
    expect(entries.map(({ handles, pointIds, vertexIds }) => ({ handles, pointIds, vertexIds }))).toEqual([
      { handles: [], pointIds: ['c'], vertexIds: ['c'] },
      { handles: [], pointIds: ['c'], vertexIds: ['c'] },
    ]);
  });

  it('should give the selected handles and the points they come out of while no point is selected', () => {
    // before
    const [entry] = getSelectedVectorPointsEntries([curve], {
      handles: [
        { end: 'start', segmentId: 's0' },
        { end: 'end', segmentId: 's0' },
      ],
      segmentIds: [],
      vertexIds: [],
    });

    // result
    expect(entry.pointIds).toEqual(['a', 'b']);
    expect(entry.handles).toHaveLength(2);
  });
});
