// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { hasRealBlendMode } from '../hasRealBlendMode';

// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

describe('hasRealBlendMode', () => {
  it('should be false when no blendMode is set', () => {
    const node = { id: 'node-1', type: NodeType.rectangle } as unknown as TSceneNode;

    expect(hasRealBlendMode(node, createCanvasRefs())).toBe(false);
  });

  it('should be false for Pass through', () => {
    const node = { blendMode: BlendMode.passThrough, id: 'node-1', type: NodeType.rectangle } as unknown as TSceneNode;

    expect(hasRealBlendMode(node, createCanvasRefs())).toBe(false);
  });

  it('should be true for any other blend mode', () => {
    const node = { blendMode: BlendMode.multiply, id: 'node-1', type: NodeType.rectangle } as unknown as TSceneNode;

    expect(hasRealBlendMode(node, createCanvasRefs())).toBe(true);
  });

  it('should be false for a node type with no blendMode field', () => {
    const node = { id: 'node-1', type: NodeType.line } as unknown as TSceneNode;

    expect(hasRealBlendMode(node, createCanvasRefs())).toBe(false);
  });

  it('should be true when a live hover preview overrides an unset/Pass-through blendMode', () => {
    const node = { id: 'node-1', type: NodeType.rectangle } as unknown as TSceneNode;
    const refs = createCanvasRefs({ blendMode: { previewRef: { current: { blendMode: BlendMode.screen, nodeId: 'node-1' } } } });

    expect(hasRealBlendMode(node, refs)).toBe(true);
  });
});
