// types
import { NodeType } from 'types/design/enums';
import { TTextNode } from 'types/design/types';

// utils
import { isPointInCurvedText } from '../isPointInCurvedText';

const buildNode = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 200,
  id: 'a',
  name: 'Text',
  parentId: null,
  pathId: 'path-1',
  rotation: 0,
  type: NodeType.text,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

describe('isPointInCurvedText', () => {
  it('should return true for a point exactly on the curve at the start of the rendered content', () => {
    // mock — a 200x200 circle centered at (100, 100); offset 0 sits at its rightmost point
    const node = buildNode();

    // result
    expect(isPointInCurvedText({ x: 200, y: 100 }, node, 5)).toBe(true);
  });

  it('should return false for a point on the curve but past the tolerance from the nearest content', () => {
    // mock — 50 world units inward from the curve at the same angle as the content start
    const node = buildNode();

    // result
    expect(isPointInCurvedText({ x: 150, y: 100 }, node, 5)).toBe(false);
  });

  it('should return false for a point on the curve at an angle the short content never reaches', () => {
    // mock — the leftmost point of the circle, half the circumference away from the content
    const node = buildNode();

    // result
    expect(isPointInCurvedText({ x: 0, y: 100 }, node, 5)).toBe(false);
  });
});
