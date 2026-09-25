// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isOpacityNode } from '../isOpacityNode';

describe('isOpacityNode', () => {
  it('should accept styled nodes and ellipses', () => {
    // result
    expect(isOpacityNode({ type: NodeType.rectangle } as TSceneNode)).toBe(true);
    expect(isOpacityNode({ type: NodeType.ellipse } as TSceneNode)).toBe(true);
  });

  it('should reject other nodes', () => {
    // result
    expect(isOpacityNode({ type: NodeType.polygon } as TSceneNode)).toBe(false);
    expect(isOpacityNode(undefined)).toBe(false);
  });
});
