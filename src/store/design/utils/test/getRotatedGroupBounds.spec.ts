// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getRotatedGroupBounds } from '../getRotatedGroupBounds';

const rect = (x: number, y: number, width: number, height: number): TRectangleNode => ({
  fill: '#fff',
  height,
  id: 'r',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width,
  x,
  y,
});

describe('getRotatedGroupBounds', () => {
  it('should match the plain axis-aligned union bounding box when rotation is 0', () => {
    // result
    expect(getRotatedGroupBounds([rect(0, 0, 20, 20), rect(60, 40, 10, 10)], 0)).toEqual({
      height: 50,
      width: 70,
      x: 0,
      y: 0,
    });
  });

  it('should fit a tight rotated box around the children’s own corners in the box’s own rotated frame', () => {
    // result — verified against a hand-computed reference: rotating every child’s own 4 world
    // corners by -30° around the origin, refitting a tight AABB there, then rotating the fitted
    // center back by +30° gives this box (tighter than fitting around the union AABB’s own corners)
    const bounds = getRotatedGroupBounds([rect(0, 0, 20, 20), rect(60, 40, 10, 10)], 30);

    expect(bounds.x).toBeCloseTo(-7.5657, 3);
    expect(bounds.y).toBeCloseTo(10.9151, 3);
    expect(bounds.width).toBeCloseTo(85.6218, 3);
    expect(bounds.height).toBeCloseTo(27.3205, 3);
  });

  it('should still fully contain every child once the returned box is rotated back into world space', () => {
    // mock — the property that actually matters: no matter the angle, the rotated box must cover
    // every child's world position, since this is what keeps a rotated group's own outline honest
    // after one of its children moves independently of the rest
    const children = [rect(0, 0, 20, 20), rect(200, 200, 10, 10)];
    const rotation = 45;
    const bounds = getRotatedGroupBounds(children, rotation);
    const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const radians = (rotation * Math.PI) / 180;
    const corners = [
      { x: bounds.x, y: bounds.y },
      { x: bounds.x + bounds.width, y: bounds.y },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      { x: bounds.x, y: bounds.y + bounds.height },
    ];
    const worldXs = corners.map((c) => center.x + (c.x - center.x) * Math.cos(radians) - (c.y - center.y) * Math.sin(radians));
    const worldYs = corners.map((c) => center.y + (c.x - center.x) * Math.sin(radians) + (c.y - center.y) * Math.cos(radians));

    expect(Math.min(...worldXs)).toBeLessThanOrEqual(0);
    expect(Math.min(...worldYs)).toBeLessThanOrEqual(0);
    expect(Math.max(...worldXs)).toBeGreaterThanOrEqual(210);
    expect(Math.max(...worldYs)).toBeGreaterThanOrEqual(210);
  });

  it('should still tightly wrap a single child, matching its own axis-aligned box when rotation is 0', () => {
    // result — no other child to widen the fit, so with rotation 0 the box is exactly the child's own
    expect(getRotatedGroupBounds([rect(10, 10, 20, 20)], 0)).toEqual({ height: 20, width: 20, x: 10, y: 10 });
  });

  it('should still fully contain a single child once rotated back into world space', () => {
    // mock — a lone axis-aligned child needs a larger box once the box itself sits at an angle, since
    // the child's own corners no longer align with the box's edges
    const bounds = getRotatedGroupBounds([rect(10, 10, 20, 20)], 30);
    const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const radians = (30 * Math.PI) / 180;
    const corners = [
      { x: bounds.x, y: bounds.y },
      { x: bounds.x + bounds.width, y: bounds.y },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      { x: bounds.x, y: bounds.y + bounds.height },
    ];
    const worldXs = corners.map((c) => center.x + (c.x - center.x) * Math.cos(radians) - (c.y - center.y) * Math.sin(radians));
    const worldYs = corners.map((c) => center.y + (c.x - center.x) * Math.sin(radians) + (c.y - center.y) * Math.cos(radians));

    expect(Math.min(...worldXs)).toBeLessThanOrEqual(10);
    expect(Math.min(...worldYs)).toBeLessThanOrEqual(10);
    expect(Math.max(...worldXs)).toBeGreaterThanOrEqual(30);
    expect(Math.max(...worldYs)).toBeGreaterThanOrEqual(30);
  });
});
