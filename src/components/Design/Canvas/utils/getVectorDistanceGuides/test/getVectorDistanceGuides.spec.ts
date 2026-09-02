// utils
import { getDistanceGuides } from '../../getDistanceGuides/getDistanceGuides';
import { getPointToPointGuides } from '../getPointToPointGuides';
import { getVectorDistanceGuides } from '../getVectorDistanceGuides';

describe('getVectorDistanceGuides', () => {
  it('should measure point-to-point when the anchor is a single point', () => {
    expect(getVectorDistanceGuides({ kind: 'point', point: { x: 0, y: 0 } }, { x: 30, y: 40 })).toEqual(
      getPointToPointGuides({ x: 0, y: 0 }, { x: 30, y: 40 }),
    );
  });

  it('should reuse the rect-vs-rect distance guides, against a zero-size target rect, when the anchor is a multi-vertex box', () => {
    const rect = { height: 50, width: 100, x: 0, y: 0 };
    const { labels, lines } = getDistanceGuides(rect, { height: 0, width: 0, x: 300, y: 25 });

    expect(getVectorDistanceGuides({ kind: 'box', rect }, { x: 300, y: 25 })).toEqual({ labels, lines });
  });
});
