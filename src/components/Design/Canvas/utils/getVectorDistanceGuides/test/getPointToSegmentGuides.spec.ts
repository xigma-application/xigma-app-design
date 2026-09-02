// utils
import { getPointToPointGuides } from '../getPointToPointGuides';
import { getPointToSegmentGuides } from '../getPointToSegmentGuides';

describe('getPointToSegmentGuides', () => {
  const straight = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ];

  it('should emit the perpendicular drop plus both along-segment runs for an interior foot', () => {
    expect(getPointToSegmentGuides({ x: 40, y: 10 }, straight)).toEqual({
      labels: [
        { anchor: { x: 20, y: 0 }, offsetDirection: { x: 0, y: -1 }, text: '40' },
        { anchor: { x: 70, y: 0 }, offsetDirection: { x: 0, y: -1 }, text: '60' },
        { anchor: { x: 40, y: 5 }, offsetDirection: { x: 1, y: 0 }, text: '10' },
      ],
      lines: [
        { dashed: true, x1: 40, x2: 0, y1: 0, y2: 0 },
        { dashed: true, x1: 40, x2: 100, y1: 0, y2: 0 },
        { dashed: false, x1: 40, x2: 40, y1: 10, y2: 0 },
      ],
    });
  });

  it('should drop the perpendicular line when the point already sits on the segment', () => {
    const result = getPointToSegmentGuides({ x: 40, y: 0 }, straight);

    expect(result.lines).toEqual([
      { dashed: true, x1: 40, x2: 0, y1: 0, y2: 0 },
      { dashed: true, x1: 40, x2: 100, y1: 0, y2: 0 },
    ]);
    expect(result.labels).toHaveLength(2);
  });

  it('should collapse to a point-to-point gap when the foot slides past an end', () => {
    expect(getPointToSegmentGuides({ x: 200, y: 10 }, straight)).toEqual(getPointToPointGuides({ x: 200, y: 10 }, { x: 100, y: 0 }));
  });

  it('should follow the bends of a curved segment along each run', () => {
    const bent = [
      { x: 0, y: 0 },
      { x: 0, y: 100 },
      { x: 100, y: 100 },
    ];

    const result = getPointToSegmentGuides({ x: 10, y: 40 }, bent);

    // foot at (0,40): start run is one dashed edge, end run walks the corner
    expect(result.lines).toEqual([
      { dashed: true, x1: 0, x2: 0, y1: 40, y2: 0 },
      { dashed: true, x1: 0, x2: 0, y1: 40, y2: 100 },
      { dashed: true, x1: 0, x2: 100, y1: 100, y2: 100 },
      { dashed: false, x1: 10, x2: 0, y1: 40, y2: 40 },
    ]);
    expect(result.labels.map((label) => label.text)).toEqual(['40', '160', '10']);
  });
});
