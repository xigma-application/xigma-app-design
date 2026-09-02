// utils
import { getDistanceGuides } from '../../getDistanceGuides/getDistanceGuides';
import { getPointToPointGuides } from '../getPointToPointGuides';
import { getPointToSegmentGuides } from '../getPointToSegmentGuides';
import { getVectorDistanceGuides } from '../getVectorDistanceGuides';

describe('getVectorDistanceGuides', () => {
  it('should measure point-to-point when a single-vertex anchor targets a vertex', () => {
    expect(getVectorDistanceGuides({ kind: 'point', point: { x: 0, y: 0 } }, { kind: 'vertex', point: { x: 30, y: 40 } })).toEqual(
      getPointToPointGuides({ x: 0, y: 0 }, { x: 30, y: 40 }),
    );
  });

  it('should measure point-to-segment when a single-vertex anchor targets a segment', () => {
    const polyline = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ];

    expect(getVectorDistanceGuides({ kind: 'point', point: { x: 40, y: 10 } }, { kind: 'segment', polyline })).toEqual(
      getPointToSegmentGuides({ x: 40, y: 10 }, polyline),
    );
  });

  it('should reuse the rect-vs-rect distance guides when a multi-vertex box anchor targets a vertex', () => {
    const rect = { height: 50, width: 100, x: 0, y: 0 };
    const { labels, lines } = getDistanceGuides(rect, { height: 0, width: 0, x: 300, y: 25 });

    expect(getVectorDistanceGuides({ kind: 'box', rect }, { kind: 'vertex', point: { x: 300, y: 25 } })).toEqual({ labels, lines });
  });

  it('should reuse the rect-vs-rect distance guides, via the segment’s own bounding box, when a box anchor targets a segment', () => {
    const rect = { height: 50, width: 100, x: 0, y: 0 };
    const polyline = [
      { x: 300, y: 10 },
      { x: 300, y: 100 },
    ];
    const { labels, lines } = getDistanceGuides(rect, { height: 90, width: 0, x: 300, y: 10 });

    expect(getVectorDistanceGuides({ kind: 'box', rect }, { kind: 'segment', polyline })).toEqual({ labels, lines });
  });
});
