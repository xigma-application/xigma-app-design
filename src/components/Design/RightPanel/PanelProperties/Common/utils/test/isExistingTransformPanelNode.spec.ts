// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isExistingTransformPanelNode } from '../isExistingTransformPanelNode';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('isExistingTransformPanelNode', () => {
  it('should be true for a vector and for a node with a box', () => {
    // result
    expect(isExistingTransformPanelNode(makeSquareVector())).toBe(true);
    expect(isExistingTransformPanelNode({ type: NodeType.rectangle, x: 0, y: 0 } as TSceneNode)).toBe(true);
  });

  it('should be false for a missing node', () => {
    // result
    expect(isExistingTransformPanelNode(undefined)).toBe(false);
  });
});
