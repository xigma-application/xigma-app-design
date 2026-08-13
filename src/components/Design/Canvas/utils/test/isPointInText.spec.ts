// types
import { NodeType } from 'types/design/enums';
import { TTextNode } from 'types/design/types';

// utils
import { isPointInText } from '../isPointInText';

const buildNode = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 500,
  id: 'a',
  name: 'Text',
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 500,
  x: 0,
  y: 0,
  ...overrides,
});

describe('isPointInText', () => {
  it('should return true for a point over the rendered text', () => {
    expect(isPointInText({ x: 2, y: 2 }, buildNode())).toBe(true);
  });

  it('should return false for a point inside the fixed box but past the rendered text', () => {
    expect(isPointInText({ x: 300, y: 300 }, buildNode())).toBe(false);
  });

  it('should return false for a point on an empty wrapped line', () => {
    // mock — a blank line between two lines of real content has zero measured width
    const node = buildNode({ content: 'Hi\n\nHi' });

    // result — y sits in the second (blank) line's row
    expect(isPointInText({ x: 2, y: 20 }, node)).toBe(false);
  });

  it('should account for flipX when locating the rendered text', () => {
    // mock — "Hi" now renders mirrored near the box's right edge instead of its left
    const node = buildNode({ flipX: true });

    // result
    expect(isPointInText({ x: 2, y: 2 }, node)).toBe(false);
    expect(isPointInText({ x: 498, y: 2 }, node)).toBe(true);
  });
});
