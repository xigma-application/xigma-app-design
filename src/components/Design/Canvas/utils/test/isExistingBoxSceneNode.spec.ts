// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isExistingBoxSceneNode } from '../isExistingBoxSceneNode';

describe('isExistingBoxSceneNode', () => {
  it('should accept a node with a box position', () => {
    // result
    expect(isExistingBoxSceneNode({ type: NodeType.frame, x: 0, y: 0 } as unknown as TSceneNode)).toBe(true);
  });

  it('should reject a missing node and a node without a box position', () => {
    // result
    expect(isExistingBoxSceneNode(undefined)).toBe(false);
    expect(isExistingBoxSceneNode({ type: NodeType.line, x1: 0, x2: 1, y1: 0, y2: 1 } as unknown as TSceneNode)).toBe(false);
  });
});
