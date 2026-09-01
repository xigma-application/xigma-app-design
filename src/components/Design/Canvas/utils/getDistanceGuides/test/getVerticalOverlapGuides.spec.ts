// utils
import { getVerticalOverlapGuides } from '../getVerticalOverlapGuides';

describe('getVerticalOverlapGuides', () => {
  it('should return only the main gap line and label when the two rects share the same top/bottom', () => {
    const active = { bottom: 100, left: 0, right: 100, top: 0 };
    const target = { bottom: 100, left: 150, right: 230, top: 0 };

    const guides = getVerticalOverlapGuides(active, target, { height: 100, width: 100, x: 0, y: 0 });

    expect(guides.lines).toEqual([{ dashed: false, x1: 100, x2: 150, y1: 50, y2: 50 }]);
    expect(guides.labels).toEqual([{ anchor: { x: 125, y: 50 }, offsetDirection: { x: 0, y: 1 }, text: '50' }]);
  });

  it('should append the side insets after the main gap line when the heights differ', () => {
    const active = { bottom: 100, left: 0, right: 100, top: 0 };
    const target = { bottom: 80, left: 150, right: 230, top: 20 };

    const guides = getVerticalOverlapGuides(active, target, { height: 100, width: 100, x: 0, y: 0 });

    expect(guides.lines).toHaveLength(5);
    expect(guides.lines[0]).toEqual({ dashed: false, x1: 100, x2: 150, y1: 50, y2: 50 });
    expect(guides.labels).toHaveLength(3);
  });
});
