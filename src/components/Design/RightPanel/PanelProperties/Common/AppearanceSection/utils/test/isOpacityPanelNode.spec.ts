// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isOpacityPanelNode } from '../isOpacityPanelNode';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('isOpacityPanelNode', () => {
  it('should accept a vector and a styled node', () => {
    // result
    expect(isOpacityPanelNode(makeSquareVector())).toBe(true);
    expect(isOpacityPanelNode({ type: NodeType.rectangle } as TSceneNode)).toBe(true);
  });

  it('should reject a text node and a missing one', () => {
    // result
    expect(isOpacityPanelNode({ type: NodeType.text } as TSceneNode)).toBe(false);
    expect(isOpacityPanelNode(undefined)).toBe(false);
  });
});
