// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isGridFrameNode } from '../isGridFrameNode';

describe('isGridFrameNode', () => {
  it('should be true only for a grid frame', () => {
    // result
    expect(isGridFrameNode({ layoutMode: LayoutMode.grid, type: NodeType.frame } as TSceneNode)).toBe(true);
    expect(isGridFrameNode({ layoutMode: LayoutMode.vertical, type: NodeType.frame } as TSceneNode)).toBe(false);
    expect(isGridFrameNode({ type: NodeType.rectangle } as TSceneNode)).toBe(false);
    expect(isGridFrameNode(undefined)).toBe(false);
  });
});
