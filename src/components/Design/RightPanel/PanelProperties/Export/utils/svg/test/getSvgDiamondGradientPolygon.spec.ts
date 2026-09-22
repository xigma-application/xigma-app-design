// utils
import { getSvgDiamondGradientPolygon } from '../getSvgDiamondGradientPolygon';

const geometry = {
  direction: { x: 1, y: 0 },
  end: { x: 10, y: 0 },
  perpendicular: { x: 0, y: 1 },
  primaryRadius: 10,
  start: { x: 5, y: 5 },
};

describe('getSvgDiamondGradientPolygon', () => {
  it('should build a 4-corner diamond scaled by distance*primaryRadius along the axes, warped by radiusRatio on the perpendicular one', () => {
    expect(getSvgDiamondGradientPolygon(geometry, 2, 0.5)).toEqual([
      { x: 10, y: 5 }, // +direction: start + 0.5*10*(1,0)
      { x: 5, y: 15 }, // +perpendicular: start + 0.5*10*2*(0,1)
      { x: 0, y: 5 }, // -direction
      { x: 5, y: -5 }, // -perpendicular
    ]);
  });

  it('should collapse to the start point at distance 0', () => {
    expect(getSvgDiamondGradientPolygon(geometry, 1, 0)).toEqual([
      { x: 5, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 5 },
    ]);
  });
});
