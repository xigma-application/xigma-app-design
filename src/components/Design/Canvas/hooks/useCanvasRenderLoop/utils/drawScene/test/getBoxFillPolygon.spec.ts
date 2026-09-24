// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getBoxFillPolygon } from '../getBoxFillPolygon';

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [],
  height: 20,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

const dedupe = (points: { x: number; y: number }[]): { x: number; y: number }[] =>
  points.filter((point, index) => index === points.findIndex((other) => other.x === point.x && other.y === point.y));

describe('getBoxFillPolygon', () => {
  it('should return the four corners of an unrotated, square-cornered rectangle', () => {
    // action
    const points = getBoxFillPolygon(rect());

    // result
    expect(dedupe(points)).toEqual([
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 20 },
      { x: 0, y: 20 },
    ]);
  });

  it('should rotate the polygon rigidly by 90 degrees around the rectangle center', () => {
    // action
    const points = getBoxFillPolygon(rect({ rotation: 90 }));
    const rounded = points.map((point) => ({ x: Math.round(point.x) || 0, y: Math.round(point.y) || 0 }));

    // result — a square rotated 90° around its own center maps back onto the same four corners
    expect(dedupe(rounded)).toEqual(
      expect.arrayContaining([
        { x: 0, y: 0 },
        { x: 20, y: 0 },
        { x: 20, y: 20 },
        { x: 0, y: 20 },
      ]),
    );
  });

  it('should round a rounded rectangle into more than four points', () => {
    // action
    const points = getBoxFillPolygon(rect({ cornerRadius: 5 }));

    // result
    expect(points.length).toBeGreaterThan(4);
  });

  it('should return the very same polygon for the same node object so downstream buffers can be reused', () => {
    // mock
    const node = rect({ cornerRadius: 4, rotation: 20 });

    // result
    expect(getBoxFillPolygon(node)).toBe(getBoxFillPolygon(node));
    expect(getBoxFillPolygon({ ...node })).not.toBe(getBoxFillPolygon(node));
  });
});
