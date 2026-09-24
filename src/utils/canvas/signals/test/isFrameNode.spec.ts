// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isFrameNode } from '../isFrameNode';
import { isGridFrameNode } from '../isGridFrameNode';

describe('isFrameNode / isGridFrameNode', () => {
  it('should recognise frames and grid frames only', () => {
    // mock
    const grid = { layoutMode: LayoutMode.grid, type: NodeType.frame } as TSceneNode;
    const free = { type: NodeType.frame } as TSceneNode;
    const rect = { type: NodeType.rectangle } as TSceneNode;

    // result
    expect([isFrameNode(grid), isFrameNode(free), isFrameNode(rect), isFrameNode(undefined)]).toEqual([true, true, false, false]);
    expect([isGridFrameNode(grid), isGridFrameNode(free), isGridFrameNode(undefined)]).toEqual([true, false, false]);
  });
});
