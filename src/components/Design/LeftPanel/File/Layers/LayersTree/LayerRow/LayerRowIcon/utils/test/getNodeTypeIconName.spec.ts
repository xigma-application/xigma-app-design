// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TMaskNode, TTextNode } from 'types/design/types';

// utils
import { getNodeTypeIconName } from '../getNodeTypeIconName';

const frameNode: TFrameNode = {
  childIds: [],
  clipContent: true,
  fill: '#ff0000',
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
});
