// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { hasNodeShapeOutline } from '../hasNodeShapeOutline';

describe('hasNodeShapeOutline', () => {
  it('should be true for shapes, lines and vectors', () => {
    // result
    [NodeType.ellipse, NodeType.line, NodeType.polygon, NodeType.rectangle, NodeType.star, NodeType.vector].forEach((type) =>
      expect(hasNodeShapeOutline({ type } as TSceneNode)).toBe(true),
    );
  });

  it('should be false for containers and text', () => {
    // result
    expect(hasNodeShapeOutline({ type: NodeType.frame } as TSceneNode)).toBe(false);
    expect(hasNodeShapeOutline({ type: NodeType.text } as TSceneNode)).toBe(false);
  });
});
