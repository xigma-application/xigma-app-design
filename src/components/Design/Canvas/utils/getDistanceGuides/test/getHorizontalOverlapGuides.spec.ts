// utils
import { getHorizontalOverlapGuides } from '../getHorizontalOverlapGuides';

describe('getHorizontalOverlapGuides', () => {
  it('should return only the main gap line and label when the two rects share the same left/right', () => {
    const active = { bottom: 100, left: 0, right: 100, top: 0 };
    const target = { bottom: 230, left: 0, right: 100, top: 150 };

    const guides = getHorizontalOverlapGuides(active, target, { height: 100, width: 100, x: 0, y: 0 });

    expect(guides.lines).toEqual([{ dashed: false, x1: 50, x2: 50, y1: 100, y2: 150 }]);
    expect(guides.labels).toEqual([{ anchor: { x: 50, y: 125 }, offsetDirection: { x: -1, y: 0 }, text: '50' }]);
  });

  it('should append the side insets after the main gap line when the widths differ', () => {
    const active = { bottom: 100, left: 0, right: 100, top: 0 };
    const target = { bottom: 230, left: 20, right: 80, top: 150 };

    const guides = getHorizontalOverlapGuides(active, target, { height: 100, width: 100, x: 0, y: 0 });

    expect(guides.lines).toHaveLength(5);
    expect(guides.lines[0]).toEqual({ dashed: false, x1: 50, x2: 50, y1: 100, y2: 150 });
    expect(guides.labels).toHaveLength(3);
  });
});
