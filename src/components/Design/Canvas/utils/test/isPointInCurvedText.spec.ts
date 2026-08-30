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

  it('should reach across the glyph height so a click on the letters, off the path line, still hits', () => {
    // mock — the glyphs sit off the path (baseline on the line); at fontSize 14 the clickable band
    // is ~5 + one line height (~17) wide, so a point 10 units off the curve is a hit, 40 is not
    const node = buildNode();

    // result
    expect(isPointInCurvedText({ x: 190, y: 100 }, node, 5)).toBe(true);
    expect(isPointInCurvedText({ x: 160, y: 100 }, node, 5)).toBe(false);
  });

  it('should return false for a point on the curve at an angle the short content never reaches', () => {
    // mock — the leftmost point of the circle, half the circumference away from the content
    const node = buildNode();

    // result
    expect(isPointInCurvedText({ x: 0, y: 100 }, node, 5)).toBe(false);
  });

  it('should follow the content to its rotated position when the node is rotated 180 degrees', () => {
    // mock — rotating 180 degrees around the circle's own center moves the start from the
    const node = buildNode({ rotation: 180 });

    // result
    expect(isPointInCurvedText({ x: 0, y: 100 }, node, 5)).toBe(true);
    expect(isPointInCurvedText({ x: 200, y: 100 }, node, 5)).toBe(false);
  });

  it('should follow the content to its mirrored position when the node is flipped horizontally', () => {
    // mock — flipping across the box's own vertical center line also moves the start from the
    const node = buildNode({ flipX: true });

    // result
    expect(isPointInCurvedText({ x: 0, y: 100 }, node, 5)).toBe(true);
    expect(isPointInCurvedText({ x: 200, y: 100 }, node, 5)).toBe(false);
  });
});
