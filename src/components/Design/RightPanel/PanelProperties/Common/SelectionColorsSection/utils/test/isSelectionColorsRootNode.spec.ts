// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isSelectionColorsRootNode } from '../isSelectionColorsRootNode';

describe('isSelectionColorsRootNode', () => {
  it('should be true for a frame or a group and false for anything else', () => {
    // action / result
    expect(isSelectionColorsRootNode({ type: NodeType.frame } as TSceneNode)).toBe(true);
    expect(isSelectionColorsRootNode({ type: NodeType.group } as TSceneNode)).toBe(true);
    expect(isSelectionColorsRootNode({ type: NodeType.rectangle } as TSceneNode)).toBe(false);
    expect(isSelectionColorsRootNode(undefined)).toBe(false);
  });
});
