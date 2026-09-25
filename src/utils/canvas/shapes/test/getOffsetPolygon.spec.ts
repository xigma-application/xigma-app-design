// types
import { TPoint } from 'types/canvas';

// utils
import { getOffsetPolygon } from '../getOffsetPolygon';

const square: TPoint[] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const getBounds = (points: TPoint[]): number[] => [
  Math.min(...points.map(({ x }) => x)),
  Math.min(...points.map(({ y }) => y)),
  Math.max(...points.map(({ x }) => x)),
  Math.max(...points.map(({ y }) => y)),
];

describe('getOffsetPolygon', () => {
  it('should move every edge outward for a positive distance and inward for a negative one', () => {
    // result
    expect(getBounds(getOffsetPolygon(square, 10) ?? [])).toEqual([-10, -10, 110, 110]);
    expect(getBounds(getOffsetPolygon([...square].reverse(), -10) ?? [])).toEqual([10, 10, 90, 90]);
  });

  it('should drop edges too short for the offset instead of folding them back', () => {
    // mock
    const chamfered: TPoint[] = [
      { x: 0, y: 0 },
      { x: 98, y: 0 },
      { x: 100, y: 2 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];

    // before
    const inset = getOffsetPolygon(chamfered, -20) ?? [];

    // result
    expect(inset).toHaveLength(4);
    expect(getBounds(inset)).toEqual([20, 20, 80, 80]);
  });

  it('should bevel a corner whose miter would reach too far', () => {
    // mock
    const spike: TPoint[] = [
      { x: 0, y: 0 },
      { x: 100, y: 5 },
      { x: 0, y: 10 },
    ];

    // before
    const outset = getOffsetPolygon(spike, 5) ?? [];

    // result
    expect(outset.length).toBeGreaterThan(3);
    expect(Math.max(...outset.map(({ x }) => x))).toBeLessThan(125);
  });

  it('should keep collinear edges as a straight side', () => {
    // mock
    const withMidpoint: TPoint[] = [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];

    // result
    expect(getBounds(getOffsetPolygon(withMidpoint, 10) ?? [])).toEqual([-10, -10, 110, 110]);
  });

  it('should give nothing when the shape vanishes or is too small to offset', () => {
    // result
    expect(getOffsetPolygon(square, -60)).toBeNull();
    expect(
      getOffsetPolygon(
        [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
        5,
      ),
    ).toBeNull();
  });

  it('should give the biggest outline when shrinking splits the shape in two', () => {
    // mock
    const dumbbell: TPoint[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 45 },
      { x: 120, y: 45 },
      { x: 120, y: 0 },
      { x: 180, y: 0 },
      { x: 180, y: 60 },
      { x: 120, y: 60 },
      { x: 120, y: 55 },
      { x: 100, y: 55 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];

    // before
    const inset = getOffsetPolygon(dumbbell, -10) ?? [];

    // result
    expect(getBounds(inset)).toEqual([10, 10, 90, 90]);
  });
});
