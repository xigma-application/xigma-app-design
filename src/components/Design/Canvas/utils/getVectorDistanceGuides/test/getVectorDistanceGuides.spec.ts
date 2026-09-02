// utils
import { getDistanceGuides } from '../../getDistanceGuides/getDistanceGuides';
import { getPointToPointGuides } from '../getPointToPointGuides';
import { getVectorDistanceGuides } from '../getVectorDistanceGuides';

describe('getVectorDistanceGuides', () => {
  it('should measure point-to-point when both ends are single points, and expose the target point for the ride-along dot', () => {
    expect(getVectorDistanceGuides({ kind: 'point', point: { x: 0, y: 0 } }, { kind: 'point', point: { x: 30, y: 40 } })).toEqual({
      ...getPointToPointGuides({ x: 0, y: 0 }, { x: 30, y: 40 }),
      targetPoint: { x: 30, y: 40 },
    });
  });

  it('should reuse the rect-vs-rect distance guides, against a zero-size target rect, when the anchor is a box and the target a point', () => {
    const rect = { height: 50, width: 100, x: 0, y: 0 };
    const { labels, lines } = getDistanceGuides(rect, { height: 0, width: 0, x: 300, y: 25 });

    expect(getVectorDistanceGuides({ kind: 'box', rect }, { kind: 'point', point: { x: 300, y: 25 } })).toEqual({
      labels,
      lines,
      targetPoint: { x: 300, y: 25 },
    });
  });

  it('should reuse the rect-vs-rect distance guides, against a zero-size anchor rect, when the anchor is a point and the target a box', () => {
    const rect = { height: 40, width: 60, x: 300, y: 0 };
    const { labels, lines } = getDistanceGuides({ height: 0, width: 0, x: 0, y: 0 }, rect);

    expect(getVectorDistanceGuides({ kind: 'point', point: { x: 0, y: 0 } }, { kind: 'box', rect })).toEqual({ labels, lines });
  });

  it('should reuse the rect-vs-rect distance guides when both ends are boxes — measuring a whole shape against another', () => {
    const anchorRect = { height: 50, width: 100, x: 0, y: 0 };
    const targetRect = { height: 40, width: 60, x: 300, y: 10 };
    const { labels, lines } = getDistanceGuides(anchorRect, targetRect);

    expect(getVectorDistanceGuides({ kind: 'box', rect: anchorRect }, { kind: 'box', rect: targetRect })).toEqual({ labels, lines });
  });
});
