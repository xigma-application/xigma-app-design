// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isImageFrameNode } from '../isImageFrameNode';

const node = (type: NodeType): TSceneNode => ({ type }) as TSceneNode;

describe('isImageFrameNode', () => {
  it('should accept nodes whose image fills are placed in their own box', () => {
    // result
    [NodeType.boolean, NodeType.frame, NodeType.rectangle, NodeType.section, NodeType.ellipse, NodeType.polygon, NodeType.star].forEach(
      (type) => expect(isImageFrameNode(node(type))).toBe(true),
    );
  });

  it('should reject other nodes and a missing node', () => {
    // result
    expect(isImageFrameNode(node(NodeType.vector))).toBe(false);
    expect(isImageFrameNode(node(NodeType.line))).toBe(false);
    expect(isImageFrameNode(undefined)).toBe(false);
  });
});
