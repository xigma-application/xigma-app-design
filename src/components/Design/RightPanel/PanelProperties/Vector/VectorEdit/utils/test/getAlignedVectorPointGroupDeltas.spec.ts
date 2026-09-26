// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';
import { TVectorPointGroup } from '../../types';

// utils
import { getAlignedVectorPointGroupDeltas } from '../getAlignedVectorPointGroupDeltas';

const groups: TVectorPointGroup[] = [
  { nodeId: 'n', rect: { height: 10, width: 10, x: 0, y: 0 }, vertexIds: ['a'] },
  { nodeId: 'n', rect: { height: 20, width: 20, x: 30, y: 20 }, vertexIds: ['b'] },
];

describe('getAlignedVectorPointGroupDeltas', () => {
  it('should move every group to the left edge of all groups', () => {
    // result
    expect(getAlignedVectorPointGroupDeltas(groups, AlignmentHorizontal.left, undefined)).toEqual([
      { x: 0, y: 0 },
      { x: -30, y: 0 },
    ]);
  });

  it('should move every group to the bottom edge of all groups', () => {
    // result
    expect(getAlignedVectorPointGroupDeltas(groups, undefined, AlignmentVertical.bottom)).toEqual([
      { x: 0, y: 30 },
      { x: 0, y: 0 },
    ]);
  });
});
