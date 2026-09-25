// types
import { StrokeDashCap, StrokeMode, StrokeProfile, StrokeStyle } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { getVectorModeStrokePolygons } from '../getVectorModeStrokePolygons';
import { makeSquareVector } from './fixtures';

const loop: TPoint[] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

describe('getVectorModeStrokePolygons', () => {
  it('should draw a brush stroke around the loop', () => {
    // before
    const polygons = getVectorModeStrokePolygons(makeSquareVector({ strokeMode: StrokeMode.brush }), loop);

    // result
    expect(polygons?.length).toBeGreaterThan(0);
  });

  it('should draw a dynamic stroke around the loop', () => {
    // before
    const polygons = getVectorModeStrokePolygons(makeSquareVector({ strokeMode: StrokeMode.dynamic }), loop);

    // result
    expect(polygons?.length).toBeGreaterThan(0);
  });

  it('should break a dashed stroke into separate dashes', () => {
    // before
    const polygons = getVectorModeStrokePolygons(
      makeSquareVector({ strokeDash: 10, strokeGap: 10, strokeStyle: StrokeStyle.dashed }),
      loop,
    );

    // result
    expect(polygons?.length).toBeGreaterThan(4);
  });

  it('should keep the dash cap of a dashed stroke', () => {
    // before
    const flat = getVectorModeStrokePolygons(makeSquareVector({ strokeDash: 10, strokeGap: 10, strokeStyle: StrokeStyle.dashed }), loop);
    const round = getVectorModeStrokePolygons(
      makeSquareVector({ strokeDash: 10, strokeDashCap: StrokeDashCap.round, strokeGap: 10, strokeStyle: StrokeStyle.dashed }),
      loop,
    );

    // result
    expect(round).not.toEqual(flat);
  });

  it('should draw a profiled ring for a width profile, flipped when asked', () => {
    // before
    const profiled = getVectorModeStrokePolygons(makeSquareVector({ strokeProfile: StrokeProfile.taper }), loop);
    const flipped = getVectorModeStrokePolygons(makeSquareVector({ strokeProfile: StrokeProfile.taper, strokeProfileFlipped: true }), loop);

    // result
    expect(profiled).toHaveLength(2);
    expect(flipped).not.toEqual(profiled);
  });

  it('should leave a plain stroke to the regular drawing', () => {
    // result
    expect(getVectorModeStrokePolygons(makeSquareVector(), loop)).toBeNull();
  });
});
