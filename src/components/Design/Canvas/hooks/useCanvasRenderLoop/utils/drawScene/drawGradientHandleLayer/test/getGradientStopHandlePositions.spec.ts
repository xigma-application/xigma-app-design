// utils
import { getGradientStopHandlePositions } from '../getGradientStopHandlePositions';

// types
import { TGradientStop } from 'types/design/paint/types';

describe('getGradientStopHandlePositions', () => {
  it('should place each stop along the start-end line, offset above it', () => {
    // before
    const stops: TGradientStop[] = [
      { color: '#ffffff', opacity: 100, position: 0 },
      { color: '#888888', opacity: 100, position: 0.5 },
      { color: '#000000', opacity: 100, position: 1 },
    ];

    // action
    const positions = getGradientStopHandlePositions({ x: 0, y: 0 }, { x: 100, y: 0 }, stops, 1);

    // result — x follows the line's lerp, y is always shifted upward by a fixed amount
    expect(positions[0].x).toBeCloseTo(0);
    expect(positions[1].x).toBeCloseTo(50);
    expect(positions[2].x).toBeCloseTo(100);
    expect(positions[0].y).toBeLessThan(0);
    expect(positions[0].y).toBe(positions[1].y);
    expect(positions[1].y).toBe(positions[2].y);
  });

  it('should offset upward regardless of the line direction, unlike a direction-dependent perpendicular', () => {
    // before
    const stops: TGradientStop[] = [{ color: '#ffffff', opacity: 100, position: 0.5 }];

    // action — a diagonal line and its exact reverse
    const forward = getGradientStopHandlePositions({ x: 0, y: 0 }, { x: 100, y: 100 }, stops, 1);
    const reversed = getGradientStopHandlePositions({ x: 100, y: 100 }, { x: 0, y: 0 }, stops, 1);

    // result — same midpoint, same upward offset either way
    expect(forward[0]).toEqual(reversed[0]);
    expect(forward[0].y).toBeLessThan(50);
  });

  it('should shrink the offset as zoom increases, keeping a constant screen-space distance', () => {
    // before
    const stops: TGradientStop[] = [{ color: '#ffffff', opacity: 100, position: 0 }];

    // action
    const atZoom1 = getGradientStopHandlePositions({ x: 0, y: 0 }, { x: 100, y: 0 }, stops, 1);
    const atZoom2 = getGradientStopHandlePositions({ x: 0, y: 0 }, { x: 100, y: 0 }, stops, 2);

    // result
    expect(Math.abs(atZoom2[0].y)).toBeCloseTo(Math.abs(atZoom1[0].y) / 2);
  });

  it('should still offset upward when start and end coincide', () => {
    // before
    const stops: TGradientStop[] = [{ color: '#ffffff', opacity: 100, position: 0 }];

    // action
    const positions = getGradientStopHandlePositions({ x: 5, y: 5 }, { x: 5, y: 5 }, stops, 1);

    // result
    expect(positions[0].x).toBeCloseTo(5);
    expect(positions[0].y).toBeLessThan(5);
  });
});
