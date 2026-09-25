// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getIsMaskChild } from '../getIsMaskChild';

const nodes = {
  content: { id: 'content', parentId: 'mask', type: NodeType.rectangle },
  group: { childIds: ['inGroup'], id: 'group', type: NodeType.group },
  inGroup: { id: 'inGroup', parentId: 'group', type: NodeType.rectangle },
  mask: { childIds: ['content', 'shape'], id: 'mask', type: NodeType.mask },
  root: { id: 'root', parentId: null, type: NodeType.rectangle },
  shape: { id: 'shape', parentId: 'mask', type: NodeType.rectangle },
} as unknown as Record<string, TSceneNode>;

describe('getIsMaskChild', () => {
  it('should be true only for the last child of a mask, which is its mask shape', () => {
    // result
    expect(getIsMaskChild(nodes.shape, nodes)).toBe(true);
    expect(getIsMaskChild(nodes.content, nodes)).toBe(false);
  });

  it('should be false for a node on the page or inside a non-mask container', () => {
    // result
    expect(getIsMaskChild(nodes.root, nodes)).toBe(false);
    expect(getIsMaskChild(nodes.inGroup, nodes)).toBe(false);
  });
});
