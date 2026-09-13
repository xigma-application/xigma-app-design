// utils
import { hasRealBlendMode } from '../hasRealBlendMode';

// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

describe('hasRealBlendMode', () => {
  it('should be false when no blendMode is set', () => {
    expect(hasRealBlendMode({ type: NodeType.rectangle } as unknown as TSceneNode)).toBe(false);
  });

  it('should be false for Pass through', () => {
    expect(hasRealBlendMode({ blendMode: BlendMode.passThrough, type: NodeType.rectangle } as unknown as TSceneNode)).toBe(false);
  });

  it('should be true for any other blend mode', () => {
    expect(hasRealBlendMode({ blendMode: BlendMode.multiply, type: NodeType.rectangle } as unknown as TSceneNode)).toBe(true);
  });

  it('should be false for a node type with no blendMode field', () => {
    expect(hasRealBlendMode({ type: NodeType.line } as unknown as TSceneNode)).toBe(false);
  });
});
