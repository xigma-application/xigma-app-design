// types
import { BooleanOperation, LayoutMode, NodeType } from 'types/design/enums';
import { TBooleanNode, TFrameNode, TMaskNode, TRectangleNode, TTextNode } from 'types/design/types';

// utils
import { getNodeTypeIconName } from '../getNodeTypeIconName';

const frameNode: TFrameNode = {
  childIds: [],
  clipContent: true,
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 10,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
};

const textNode: TTextNode = {
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 20,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 100,
  x: 0,
  y: 0,
};

describe('getNodeTypeIconName', () => {
  it('should fall back to the shared NODE_TYPE_ICON entry for a non-text node', () => {
    expect(getNodeTypeIconName(frameNode, false)).toBe('FrameTool');
  });

  it('should return the Image and Video icons for rectangles filled only with an image or a video', () => {
    // mock
    const rectangle: TRectangleNode = {
      fills: [{ opacity: 100, ref: 'blob:media', rotation: 0, scaleMode: 'fill', type: 'image' }],
      height: 10,
      id: 'rect-1',
      name: 'Image',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    };
    const videoRectangle: TRectangleNode = {
      ...rectangle,
      fills: [{ opacity: 100, ref: 'blob:media', rotation: 0, scaleMode: 'fill', type: 'video' }],
    };

    // result
    expect(getNodeTypeIconName(rectangle, false)).toBe('Image');
    expect(getNodeTypeIconName(videoRectangle, false)).toBe('Video');
    expect(getNodeTypeIconName({ ...rectangle, fills: [] }, false)).toBe('RectangleTool');
  });

  it('should return the plain text icon for a text node with no pathId', () => {
    expect(getNodeTypeIconName(textNode, false)).toBe('TextTool');
  });

  it('should return the text-on-path icon for a text node bound to a path', () => {
    expect(getNodeTypeIconName({ ...textNode, pathId: 'vector-1' }, false)).toBe('TextOnPathTool');
  });

  it('should return the layout-mode icon for a frame with auto layout', () => {
    expect(getNodeTypeIconName({ ...frameNode, layoutMode: LayoutMode.horizontal }, false)).toBe('LayoutHorizontal');
  });

  it('should prefer the mask icon over the layout-mode icon for a masked auto-layout frame', () => {
    expect(getNodeTypeIconName({ ...frameNode, layoutMode: LayoutMode.horizontal }, true)).toBe('MaskGroup');
  });

  it('should use the plain "Mask" container icon for a Mask node itself, distinct from "MaskGroup" used by its masked child', () => {
    const maskContainer: TMaskNode = {
      childIds: ['a', 'b'],
      height: 10,
      id: 'mask-1',
      name: 'Mask group',
      parentId: null,
      rotation: 0,
      type: NodeType.mask,
      width: 10,
      x: 0,
      y: 0,
    };

    // isMask here answers "is this row itself the masked child of its parent" — false for the
    // container row, since the container isn't masked by anything above it
    expect(getNodeTypeIconName(maskContainer, false)).toBe('Mask');
  });

  it.each([
    [BooleanOperation.union, 'BooleanUnion'],
    [BooleanOperation.subtract, 'BooleanSubtract'],
    [BooleanOperation.intersect, 'BooleanIntersect'],
    [BooleanOperation.exclude, 'BooleanExclude'],
  ])('should return the %s operation icon for a boolean node', (booleanOperation, iconName) => {
    // mock
    const booleanNode = { ...frameNode, booleanOperation, type: NodeType.boolean } as unknown as TBooleanNode;

    // action / result
    expect(getNodeTypeIconName(booleanNode, false)).toBe(iconName);
  });
});
