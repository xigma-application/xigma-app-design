// utils
import { getNodeBlendMode } from '../getNodeBlendMode';

// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

describe('getNodeBlendMode', () => {
  it("should read a box node's own blendMode", () => {
    // before
    const node = { blendMode: BlendMode.multiply, type: NodeType.rectangle } as unknown as TSceneNode;

    // result
    expect(getNodeBlendMode(node)).toBe(BlendMode.multiply);
  });

  it('should return undefined for a node type with no blendMode field', () => {
    // before
    const node = { type: NodeType.line } as unknown as TSceneNode;

    // result
    expect(getNodeBlendMode(node)).toBeUndefined();
  });
});
