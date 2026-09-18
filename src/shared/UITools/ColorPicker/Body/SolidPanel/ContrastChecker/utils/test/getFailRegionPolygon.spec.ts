// types
import { TContrastBoundary } from '../../types';

// utils
import { getFailRegionPolygon } from '../getFailRegionPolygon';

const lighterBoundary: TContrastBoundary = {
  passSide: 'lighter',
  points: [
    { s: 0, v: 80 },
    { s: 50, v: 90 },
    { s: 100, v: 95 },
  ],
};

const darkerBoundary: TContrastBoundary = {
  passSide: 'darker',
  points: [
    { s: 0, v: 20 },
    { s: 50, v: 30 },
    { s: 100, v: 40 },
  ],
};

describe('getFailRegionPolygon', () => {
  it('should return null when there are no boundaries at all', () => {
    expect(getFailRegionPolygon([])).toBeNull();
  });

  it('should close a lighter-side boundary down to v=0, since the failing side is below the pass curve', () => {
    const polygon = getFailRegionPolygon([lighterBoundary])!;

    expect(polygon.slice(0, 3)).toEqual(lighterBoundary.points);
    expect(polygon.slice(3)).toEqual([
      { s: 100, v: 0 },
      { s: 50, v: 0 },
      { s: 0, v: 0 },
    ]);
  });

  it('should close a darker-side boundary up to v=100, since the failing side is above the pass curve', () => {
    const polygon = getFailRegionPolygon([darkerBoundary])!;

    expect(polygon.slice(0, 3)).toEqual(darkerBoundary.points);
    expect(polygon.slice(3)).toEqual([
      { s: 100, v: 100 },
      { s: 50, v: 100 },
      { s: 0, v: 100 },
    ]);
  });

  it('should return the band strictly between the two curves when both boundaries exist', () => {
    const polygon = getFailRegionPolygon([lighterBoundary, darkerBoundary])!;

    expect(polygon.slice(0, 3)).toEqual(lighterBoundary.points);
    expect(polygon.slice(3)).toEqual([
      { s: 100, v: 40 },
      { s: 50, v: 30 },
      { s: 0, v: 20 },
    ]);
  });

  it('should only use the saturations both curves share when their sample ranges differ', () => {
    const partialDarker: TContrastBoundary = { passSide: 'darker', points: [{ s: 50, v: 30 }] };
    const polygon = getFailRegionPolygon([lighterBoundary, partialDarker])!;

    expect(polygon).toEqual([
      { s: 50, v: 90 },
      { s: 50, v: 30 },
    ]);
  });

  it('should return null when the two boundaries share no saturation samples at all', () => {
    const disjointDarker: TContrastBoundary = { passSide: 'darker', points: [{ s: 25, v: 10 }] };

    expect(getFailRegionPolygon([lighterBoundary, disjointDarker])).toBeNull();
  });
});
