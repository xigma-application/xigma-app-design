// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getFrameNameLabelCacheKey } from '../getFrameNameLabelCacheKey';

const node: TFrameNode = {
  childIds: [],
  clipContent: true,
  fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
  height: 100,
  id: 'frame-1',
  name: 'Frame 1',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 10,
  y: 20,
};

describe('getFrameNameLabelCacheKey', () => {
  it('should be the same for the same node and zoom', () => {
    // result
    expect(getFrameNameLabelCacheKey(node, 1)).toBe(getFrameNameLabelCacheKey({ ...node }, 1));
  });

  it('should change when the node changes, like its name, position, size or rotation', () => {
    // result
    expect(getFrameNameLabelCacheKey(node, 1)).not.toBe(getFrameNameLabelCacheKey({ ...node, name: 'Other' }, 1));
    expect(getFrameNameLabelCacheKey(node, 1)).not.toBe(getFrameNameLabelCacheKey({ ...node, x: 99 }, 1));
    expect(getFrameNameLabelCacheKey(node, 1)).not.toBe(getFrameNameLabelCacheKey({ ...node, width: 99 }, 1));
    expect(getFrameNameLabelCacheKey(node, 1)).not.toBe(getFrameNameLabelCacheKey({ ...node, rotation: 45 }, 1));
  });

  it('should change when the zoom changes', () => {
    // result
    expect(getFrameNameLabelCacheKey(node, 1)).not.toBe(getFrameNameLabelCacheKey(node, 2));
  });
});
