// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isSelectionColorNode } from '../isSelectionColorNode';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('isSelectionColorNode', () => {
  it('should accept a vector and an appearance node', () => {
    // result
    expect(isSelectionColorNode(makeSquareVector())).toBe(true);
    expect(isSelectionColorNode({ type: NodeType.rectangle } as TSceneNode)).toBe(true);
  });

  it('should reject a text node and a missing one', () => {
    // result
    expect(isSelectionColorNode({ type: NodeType.text } as TSceneNode)).toBe(false);
    expect(isSelectionColorNode(undefined)).toBe(false);
  });
});
