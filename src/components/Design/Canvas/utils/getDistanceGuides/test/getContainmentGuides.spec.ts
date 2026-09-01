// utils
import { getContainmentGuides } from '../getContainmentGuides';

describe('getContainmentGuides', () => {
  it('should draw a padding measurement on all four sides for a small element nested inside a bigger container', () => {
    // before — outer container (0,0,100,100), inner element (20,20,50,30)
    const outer = { bottom: 100, left: 0, right: 100, top: 0 };
    const inner = { bottom: 50, left: 20, right: 70, top: 20 };

    // result — top/bottom lines run through the inner element's own horizontal center, left/right
    // lines run through its vertical center, each measuring from the container's edge to the
    // element's own edge
    const guides = getContainmentGuides(outer, inner, { height: 30, width: 50, x: 20, y: 20 });

    expect(guides.lines).toEqual([
      { dashed: false, x1: 45, x2: 45, y1: 0, y2: 20 },
      { dashed: false, x1: 45, x2: 45, y1: 50, y2: 100 },
      { dashed: false, x1: 0, x2: 20, y1: 35, y2: 35 },
      { dashed: false, x1: 70, x2: 100, y1: 35, y2: 35 },
    ]);
    expect(guides.labels).toEqual([
      { anchor: { x: 45, y: 10 }, offsetDirection: { x: -1, y: 0 }, text: '20' },
      { anchor: { x: 45, y: 75 }, offsetDirection: { x: -1, y: 0 }, text: '50' },
      { anchor: { x: 10, y: 35 }, offsetDirection: { x: 0, y: 1 }, text: '20' },
      { anchor: { x: 85, y: 35 }, offsetDirection: { x: 0, y: 1 }, text: '30' },
    ]);
  });

  it('should omit a side already flush with the container', () => {
    // before — flush against the container's left and top edges, so only the right/bottom sides measure
    const outer = { bottom: 100, left: 0, right: 100, top: 0 };
    const inner = { bottom: 30, left: 0, right: 50, top: 0 };

    const guides = getContainmentGuides(outer, inner, { height: 30, width: 50, x: 0, y: 0 });

    expect(guides.lines).toEqual([
      { dashed: false, x1: 25, x2: 25, y1: 30, y2: 100 },
      { dashed: false, x1: 50, x2: 100, y1: 15, y2: 15 },
    ]);
  });

  it('should report no lines for two rects with fully matching edges', () => {
    // before
    const rect = { bottom: 100, left: 0, right: 100, top: 0 };

    const guides = getContainmentGuides(rect, rect, { height: 100, width: 100, x: 0, y: 0 });

    expect(guides).toEqual({ labels: [], lines: [] });
  });
});
