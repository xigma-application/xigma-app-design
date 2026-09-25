// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isStyledNode } from '../isStyledNode';

describe('isStyledNode', () => {
  it('should accept the appearance nodes and lines', () => {
    // result
    expect(isStyledNode({ type: NodeType.rectangle } as TSceneNode)).toBe(true);
    expect(isStyledNode({ type: NodeType.line } as TSceneNode)).toBe(true);
    expect(isStyledNode({ type: NodeType.polygon } as TSceneNode)).toBe(true);
    expect(isStyledNode({ type: NodeType.star } as TSceneNode)).toBe(true);
  });

  it('should reject every other node and a missing one', () => {
    // result
    expect(isStyledNode({ type: NodeType.text } as TSceneNode)).toBe(false);
    expect(isStyledNode(undefined)).toBe(false);
  });
});
