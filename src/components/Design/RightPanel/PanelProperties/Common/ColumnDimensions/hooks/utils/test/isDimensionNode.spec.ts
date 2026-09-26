// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isDimensionNode } from '../isDimensionNode';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('isDimensionNode', () => {
  it('should accept box nodes and vectors', () => {
    // mock
    const rectangle = { height: 1, id: 'r', type: NodeType.rectangle, width: 1, x: 0, y: 0 } as unknown as TSceneNode;

    // result
    expect(isDimensionNode(rectangle)).toBe(true);
    expect(isDimensionNode(makeSquareVector())).toBe(true);
  });

  it('should reject a missing node and nodes without a size', () => {
    // mock
    const line = { id: 'l', type: NodeType.line } as unknown as TSceneNode;

    // result
    expect(isDimensionNode(undefined)).toBe(false);
    expect(isDimensionNode(line)).toBe(false);
  });
});
