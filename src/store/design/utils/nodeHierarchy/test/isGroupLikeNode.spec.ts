// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isGroupLikeNode } from '../isGroupLikeNode';

describe('isGroupLikeNode', () => {
  it('should be true for booleans, groups and masks only', () => {
    // result
    expect(isGroupLikeNode({ type: NodeType.boolean } as TSceneNode)).toBe(true);
    expect(isGroupLikeNode({ type: NodeType.group } as TSceneNode)).toBe(true);
    expect(isGroupLikeNode({ type: NodeType.mask } as TSceneNode)).toBe(true);
    expect(isGroupLikeNode({ type: NodeType.frame } as TSceneNode)).toBe(false);
  });
});
