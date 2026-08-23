// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TTextNode } from 'types/design/types';

// utils
import { getDoubleClickedTextNode } from '../getDoubleClickedTextNode';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const textNode: TTextNode = {
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 500,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 500,
  x: 0,
  y: 0,
};

const frameNode: TFrameNode = {
  fill: '#ff0000',
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 1000,
  y: 1000,
};

describe('getDoubleClickedTextNode', () => {
  it('should return the text node when the point hits its rendered content, even if unselected', () => {
    // result — "Hi" only occupies a small area near the top-left of the 500x500 box
    expect(getDoubleClickedTextNode({ x: 2, y: 2 }, [textNode], IDENTITY_VIEWPORT)).toEqual(textNode);
  });

  it('should return null for a point past the rendered content, even when the text node is selected', () => {
    // result — no fixed-box fallback: entering edit mode requires actually hitting the glyphs
    expect(getDoubleClickedTextNode({ x: 300, y: 300 }, [textNode], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null for a non-text node', () => {
    // result
    expect(getDoubleClickedTextNode({ x: 1050, y: 1050 }, [frameNode], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null for a point over empty canvas', () => {
    // result
    expect(getDoubleClickedTextNode({ x: 5000, y: 5000 }, [textNode, frameNode], IDENTITY_VIEWPORT)).toBeNull();
  });
});
