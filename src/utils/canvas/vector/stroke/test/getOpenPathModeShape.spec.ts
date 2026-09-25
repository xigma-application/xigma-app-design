// types
import { StrokeDashCap, StrokeProfile, StrokeStyle } from 'types/design/enums';

// utils
import { buildOpenPolylineStrokeRing } from '../buildOpenPolylineStrokeRing';
import { getOpenPathModeShape } from '../getOpenPathModeShape';
import { makeSquareVector } from './fixtures';

const ring = buildOpenPolylineStrokeRing(
  [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
  ],
  5,
);

describe('getOpenPathModeShape', () => {
  it('should run a brush along the open path, filled even-odd', () => {
    // before
    const shape = getOpenPathModeShape(makeSquareVector(), ring, 'brush');

    // result
    expect(shape?.fillRule).toBe('evenOdd');
    expect(shape?.polygons.length).toBeGreaterThan(0);
  });

  it('should draw nothing for an unknown brush', () => {
    // result
    expect(getOpenPathModeShape(makeSquareVector({ strokeBrush: 'unknown' }), ring, 'brush')).toBeNull();
  });

  it('should draw a dynamic band along the open path, filled nonzero', () => {
    // before
    const shape = getOpenPathModeShape(makeSquareVector(), ring, 'dynamic');

    // result
    expect(shape?.fillRule).toBe('nonZero');
    expect(shape?.polygons).toHaveLength(1);
  });

  it('should draw nothing for a dynamic stroke without a frequency', () => {
    // result
    expect(getOpenPathModeShape(makeSquareVector({ strokeDynamicFrequency: 0 }), ring, 'dynamic')).toBeNull();
  });

  it('should cut dashes along the open path with their cap', () => {
    // before
    const shape = getOpenPathModeShape(
      makeSquareVector({ strokeDash: 10, strokeDashCap: StrokeDashCap.round, strokeGap: 10, strokeStyle: StrokeStyle.dashed }),
      ring,
      'dashed',
    );

    // result
    expect(shape?.fillRule).toBe('nonZero');
    expect(shape?.polygons).toHaveLength(10);
  });

  it('should fall back to flat dashes and to nothing when the pattern needs too many dashes', () => {
    // result
    expect(
      getOpenPathModeShape(makeSquareVector({ strokeDash: 10, strokeGap: 10, strokeStyle: StrokeStyle.dashed }), ring, 'dashed')?.polygons,
    ).toHaveLength(10);
    expect(
      getOpenPathModeShape(makeSquareVector({ strokeDash: 0.001, strokeGap: 0.001, strokeStyle: StrokeStyle.dashed }), ring, 'dashed'),
    ).toBeNull();
  });

  it('should draw a width profile band, flipped when asked', () => {
    // before
    const profiled = getOpenPathModeShape(makeSquareVector({ strokeProfile: StrokeProfile.wedge }), ring, 'profile');
    const flipped = getOpenPathModeShape(
      makeSquareVector({ strokeProfile: StrokeProfile.wedge, strokeProfileFlipped: true }),
      ring,
      'profile',
    );

    // result
    expect(profiled?.polygons).toHaveLength(1);
    expect(flipped).not.toEqual(profiled);
  });

  it('should leave a uniform stroke to the plain band', () => {
    // result
    expect(getOpenPathModeShape(makeSquareVector(), ring, 'uniform')).toBeNull();
  });
});
