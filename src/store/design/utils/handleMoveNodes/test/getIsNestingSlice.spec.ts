// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getIsNestingSlice } from '../getIsNestingSlice';

const nodesById = {
  frame: { id: 'frame', type: NodeType.frame },
  rectangle: { id: 'rectangle', type: NodeType.rectangle },
  slice: { id: 'slice', type: NodeType.slice },
} as unknown as Record<string, TSceneNode>;

describe('getIsNestingSlice', () => {
  it('should be true when a slice is moved into any parent', () => {
    // result
    expect(getIsNestingSlice('frame', ['rectangle', 'slice'], nodesById)).toBe(true);
  });

  it('should be false for a move to the page or a move without slices', () => {
    // result
    expect(getIsNestingSlice(null, ['slice'], nodesById)).toBe(false);
    expect(getIsNestingSlice('frame', ['rectangle', 'missing'], nodesById)).toBe(false);
  });
});
