// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { getNodeBlendMode } from '../getNodeBlendMode';

// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

describe('getNodeBlendMode', () => {
  it("should read a box node's own blendMode", () => {
    // before
    const node = { blendMode: BlendMode.multiply, id: 'node-1', type: NodeType.rectangle } as unknown as TSceneNode;

    // result
    expect(getNodeBlendMode(node, createCanvasRefs())).toBe(BlendMode.multiply);
  });

  it('should return undefined for a node type with no blendMode field', () => {
    // before
    const node = { id: 'node-1', type: NodeType.line } as unknown as TSceneNode;

    // result
    expect(getNodeBlendMode(node, createCanvasRefs())).toBeUndefined();
  });

  it('should prefer a live hover preview over the committed blendMode', () => {
    // before
    const node = { blendMode: BlendMode.multiply, id: 'node-1', type: NodeType.rectangle } as unknown as TSceneNode;
    const refs = createCanvasRefs({ blendMode: { previewRef: { current: { blendMode: BlendMode.screen, nodeId: 'node-1' } } } });

    // result
    expect(getNodeBlendMode(node, refs)).toBe(BlendMode.screen);
  });

  it('should ignore a preview meant for a different node', () => {
    // before
    const node = { blendMode: BlendMode.multiply, id: 'node-1', type: NodeType.rectangle } as unknown as TSceneNode;
    const refs = createCanvasRefs({ blendMode: { previewRef: { current: { blendMode: BlendMode.screen, nodeId: 'node-2' } } } });

    // result
    expect(getNodeBlendMode(node, refs)).toBe(BlendMode.multiply);
  });
});
