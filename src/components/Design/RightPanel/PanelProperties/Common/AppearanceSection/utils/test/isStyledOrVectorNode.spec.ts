// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isStyledOrVectorNode } from '../isStyledOrVectorNode';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('isStyledOrVectorNode', () => {
  it('should accept a vector and a styled node', () => {
    // result
    expect(isStyledOrVectorNode(makeSquareVector())).toBe(true);
    expect(isStyledOrVectorNode({ type: NodeType.polygon } as TSceneNode)).toBe(true);
  });

  it('should reject a text node and a missing one', () => {
    // result
    expect(isStyledOrVectorNode({ type: NodeType.text } as TSceneNode)).toBe(false);
    expect(isStyledOrVectorNode(undefined)).toBe(false);
  });
});
