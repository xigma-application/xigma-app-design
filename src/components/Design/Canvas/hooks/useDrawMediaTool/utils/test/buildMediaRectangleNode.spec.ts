// types
import { NodeType } from 'types/design/enums';

// utils
import { buildMediaRectangleNode } from '../buildMediaRectangleNode';

const rect = { height: 50, width: 100, x: 10, y: 20 };

describe('buildMediaRectangleNode', () => {
  it('should build a rectangle named after the tool with one image fill', () => {
    // before
    const node = buildMediaRectangleNode(
      rect,
      { kind: 'image', naturalHeight: 50, naturalWidth: 100, src: 'blob:image' },
      'Image',
      'parent-1',
    );

    // result
    expect(node).toEqual({
      ...rect,
      fills: [{ opacity: 100, ref: 'blob:image', rotation: 0, scaleMode: 'fill', type: 'image' }],
      name: 'Image',
      parentId: 'parent-1',
      rotation: 0,
      type: NodeType.rectangle,
    });
  });

  it('should build a rectangle named Video with one video fill', () => {
    // before
    const node = buildMediaRectangleNode(rect, { kind: 'video', naturalHeight: 50, naturalWidth: 100, src: 'blob:frame' }, 'Image', null);

    // result
    expect(node).toMatchObject({
      fills: [{ opacity: 100, ref: 'blob:frame', rotation: 0, scaleMode: 'fill', type: 'video' }],
      name: 'Video',
      parentId: null,
      type: NodeType.rectangle,
    });
  });
});
