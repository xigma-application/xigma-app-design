// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TTextNode } from 'types/design/types';

// utils
import { getNodeTypeIconName } from '../getNodeTypeIconName';

const frameNode: TFrameNode = {
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
    expect(getNodeTypeIconName(frameNode)).toBe('FrameTool');
  });

  it('should return the plain text icon for a text node with no pathId', () => {
    expect(getNodeTypeIconName(textNode)).toBe('TextTool');
  });

  it('should return the text-on-path icon for a text node bound to a path', () => {
    expect(getNodeTypeIconName({ ...textNode, pathId: 'vector-1' })).toBe('TextOnPathTool');
  });
});
