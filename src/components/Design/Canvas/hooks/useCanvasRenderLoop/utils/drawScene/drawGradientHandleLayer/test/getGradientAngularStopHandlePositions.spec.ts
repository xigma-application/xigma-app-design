// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getGradientAngularStopHandlePositions } from '../getGradientAngularStopHandlePositions';

const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('getGradientAngularStopHandlePositions', () => {
  it('should return one world point per stop, computed by angle and nudged outward off the ellipse', () => {
    // before
    const paint: TGradientPaint = {
      end: { x: 0.5, y: 1 },
      opacity: 100,
      start: { x: 0.5, y: 0.5 },
      stops: [
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 0.25 },
      ],
      type: 'gradient-angular',
    };

    // action
    const positions = getGradientAngularStopHandlePositions(BOUNDS, 0, paint, 1);

    // result — position 0 sits on the ellipse at (50,100), pushed 18px further down (away from the
    // center); position 0.25 sits at (0,50), pushed 18px further left
    expect(positions).toHaveLength(2);
    expect(positions[0].x).toBeCloseTo(50, 5);
    expect(positions[0].y).toBeCloseTo(118, 5);
    expect(positions[1].x).toBeCloseTo(-18, 5);
    expect(positions[1].y).toBeCloseTo(50, 5);
  });

  it('should shrink the outward offset as zoom increases, so it stays a constant size on screen', () => {
    // before
    const paint: TGradientPaint = {
      end: { x: 0.5, y: 1 },
      opacity: 100,
      start: { x: 0.5, y: 0.5 },
      stops: [{ color: '#ffffff', opacity: 100, position: 0 }],
      type: 'gradient-angular',
    };

    // action
    const positions = getGradientAngularStopHandlePositions(BOUNDS, 0, paint, 2);

    // result — offset halves to 9px at zoom 2
    expect(positions[0].y).toBeCloseTo(109, 5);
  });
});
