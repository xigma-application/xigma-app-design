// utils
import { getGradientStopHandlePositions } from '../getGradientStopHandlePositions';

// types
import { TGradientStop } from 'types/design/paint/types';

describe('getGradientStopHandlePositions', () => {
  it('should place each stop along the start-end line, offset to one side', () => {
    // before
    const stops: TGradientStop[] = [
      { color: '#ffffff', opacity: 100, position: 0 },
      { color: '#888888', opacity: 100, position: 0.5 },
      { color: '#000000', opacity: 100, position: 1 },
    ];

    // action
    const positions = getGradientStopHandlePositions({ x: 0, y: 0 }, { x: 100, y: 0 }, stops, 1);

    // result — for a horizontal line, the perpendicular offset only moves the y coordinate
    expect(positions[0].x).toBeCloseTo(0);
    expect(positions[1].x).toBeCloseTo(50);
    expect(positions[2].x).toBeCloseTo(100);
    expect(positions[0].y).not.toBe(0);
    expect(positions[0].y).toBe(positions[1].y);
    expect(positions[1].y).toBe(positions[2].y);
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

  it('should not throw when start and end coincide', () => {
    // before
    const stops: TGradientStop[] = [{ color: '#ffffff', opacity: 100, position: 0 }];

    // action
    const positions = getGradientStopHandlePositions({ x: 5, y: 5 }, { x: 5, y: 5 }, stops, 1);

    // result
    expect(positions[0]).toEqual({ x: 5, y: 5 });
  });
});
