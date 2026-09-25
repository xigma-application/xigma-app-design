// types
import { TPoint } from 'types/canvas';

// utils
import { getRawOffsetLoop } from '../getRawOffsetLoop';

const square: TPoint[] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

describe('getRawOffsetLoop', () => {
  it('should meet the moved sides in one mitred point at each growing corner', () => {
    // result
    expect(getRawOffsetLoop(square, 10, 1)).toEqual([
      { x: -10, y: -10 },
      { x: 110, y: -10 },
      { x: 110, y: 110 },
      { x: -10, y: 110 },
    ]);
  });

  it('should meet the moved sides in one point at a shrinking corner while both sides stay long enough', () => {
    // result
    expect(getRawOffsetLoop(square, -10, 1)).toEqual([
      { x: 10, y: 10 },
      { x: 90, y: 10 },
      { x: 90, y: 90 },
      { x: 10, y: 90 },
    ]);
  });

  it('should go round the original corner when a side is too short for its shrinking corners', () => {
    // before
    const loop = getRawOffsetLoop(square, -60, 1);

    // result
    expect(loop).toHaveLength(12);
    expect(loop.slice(0, 3)).toEqual([
      { x: 60, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 60 },
    ]);
  });

  it('should bevel a growing corner whose miter reaches too far', () => {
    // mock
    const spike: TPoint[] = [
      { x: 0, y: 0 },
      { x: 100, y: 5 },
      { x: 0, y: 10 },
    ];

    // result
    expect(getRawOffsetLoop(spike, 5, 1).length).toBeGreaterThan(3);
  });

  it('should pass straight through a point in the middle of a side and bevel a side that turns right back', () => {
    // mock
    const withMidpoint: TPoint[] = [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ];
    const needle: TPoint[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ];

    // result
    expect(getRawOffsetLoop(withMidpoint, 10, 1)).toHaveLength(4);
    expect(getRawOffsetLoop(needle, 10, 1)).toHaveLength(4);
  });
});
