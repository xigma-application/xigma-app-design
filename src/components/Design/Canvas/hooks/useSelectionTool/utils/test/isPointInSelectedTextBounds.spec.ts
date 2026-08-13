// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isPointInSelectedTextBounds } from '../isPointInSelectedTextBounds';

const buildTextNode = (id = 'a'): TSceneNode => ({
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 500,
  id,
  name: 'Text',
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 500,
  x: 0,
  y: 0,
});

const buildFrameNode = (): TSceneNode => ({
  fill: '#ff0000',
  height: 10,
  id: 'b',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
});

describe('isPointInSelectedTextBounds', () => {
  it('should return true for a point inside the fixed box of a single selected text node', () => {
    expect(isPointInSelectedTextBounds({ x: 300, y: 300 }, [buildTextNode()])).toBe(true);
  });

  it('should return false when nothing is selected', () => {
    expect(isPointInSelectedTextBounds({ x: 5, y: 5 }, [])).toBe(false);
  });

  it('should return false when more than one node is selected', () => {
    expect(isPointInSelectedTextBounds({ x: 300, y: 300 }, [buildTextNode(), buildTextNode('c')])).toBe(false);
  });

  it('should return false when the single selected node is not text', () => {
    expect(isPointInSelectedTextBounds({ x: 5, y: 5 }, [buildFrameNode()])).toBe(false);
  });

  it('should return false when the point falls outside the box entirely', () => {
    expect(isPointInSelectedTextBounds({ x: 900, y: 900 }, [buildTextNode()])).toBe(false);
  });
});
