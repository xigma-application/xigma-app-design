// types
import { TVectorPointGroup } from '../../types';

// utils
import { getDistributedVectorPointGroupDeltas } from '../getDistributedVectorPointGroupDeltas';

const groups: TVectorPointGroup[] = [
  { nodeId: 'n', rect: { height: 10, width: 10, x: 100, y: 0 }, vertexIds: ['c'] },
  { nodeId: 'n', rect: { height: 10, width: 10, x: 0, y: 0 }, vertexIds: ['a'] },
  { nodeId: 'n', rect: { height: 10, width: 10, x: 20, y: 50 }, vertexIds: ['b'] },
];

describe('getDistributedVectorPointGroupDeltas', () => {
  it('should space the groups evenly along the horizontal axis', () => {
    // result
    expect(getDistributedVectorPointGroupDeltas(groups, 'horizontal')).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 30, y: 0 },
    ]);
  });

  it('should space the groups evenly along the vertical axis', () => {
    // result
    expect(getDistributedVectorPointGroupDeltas(groups, 'vertical')).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 25 },
      { x: 0, y: 0 },
    ]);
  });
});
