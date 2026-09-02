// utils
import { getPointToPointGuides } from '../getPointToPointGuides';
import { getPointToSegmentGuides } from '../getPointToSegmentGuides';
import { getVectorDistanceGuides } from '../getVectorDistanceGuides';

describe('getVectorDistanceGuides', () => {
  it('should measure point-to-point when the target is a vertex', () => {
    expect(getVectorDistanceGuides({ point: { x: 0, y: 0 } }, { kind: 'vertex', point: { x: 30, y: 40 } })).toEqual(
      getPointToPointGuides({ x: 0, y: 0 }, { x: 30, y: 40 }),
    );
  });

  it('should measure point-to-segment when the target is a segment', () => {
    const polyline = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ];

    expect(getVectorDistanceGuides({ point: { x: 40, y: 10 } }, { kind: 'segment', polyline })).toEqual(
      getPointToSegmentGuides({ x: 40, y: 10 }, polyline),
    );
  });
});
