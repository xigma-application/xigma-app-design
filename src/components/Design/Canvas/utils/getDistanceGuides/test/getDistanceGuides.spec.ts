// utils
import { getDistanceGuides } from '../getDistanceGuides';

describe('getDistanceGuides', () => {
  it('should dispatch to the containment branch when both axes overlap', () => {
    // before — a small selected element nested inside a bigger hovered frame
    const guides = getDistanceGuides({ height: 30, width: 50, x: 20, y: 20 }, { height: 100, width: 100, x: 0, y: 0 });

    // result — the containment branch's own signature: four solid (never dashed) padding lines
    expect(guides.lines).toHaveLength(4);
    expect(guides.lines.every((line) => !line.dashed)).toBe(true);
  });

  it('should produce the same containment result with the roles swapped', () => {
    // before — same two rects, but now the container is active/selected and the small element is
    // the hovered target; the user expects an identical result either way
    const containerSelected = getDistanceGuides({ height: 100, width: 100, x: 0, y: 0 }, { height: 30, width: 50, x: 20, y: 20 });
    const elementSelected = getDistanceGuides({ height: 30, width: 50, x: 20, y: 20 }, { height: 100, width: 100, x: 0, y: 0 });

    // result
    expect(containerSelected).toEqual(elementSelected);
  });

  it('should report no guides for two identical, fully overlapping rects', () => {
    // before — degenerate containment case
    const guides = getDistanceGuides({ height: 100, width: 100, x: 0, y: 0 }, { height: 100, width: 100, x: 0, y: 0 });

    // result
    expect(guides).toEqual({ labels: [], lines: [] });
  });

  it('should dispatch to the vertical-overlap branch when only the vertical ranges overlap', () => {
    // before — target sits to the right, vertically overlapping
    const guides = getDistanceGuides({ height: 100, width: 100, x: 0, y: 0 }, { height: 60, width: 80, x: 150, y: 20 });

    // result — a horizontal (constant-y) gap line, the vertical-overlap branch's own signature
    expect(guides.lines[0]).toMatchObject({ y1: guides.lines[0].y2 });
  });

  it('should dispatch to the horizontal-overlap branch when only the horizontal ranges overlap', () => {
    // before — target sits below, horizontally overlapping
    const guides = getDistanceGuides({ height: 100, width: 100, x: 0, y: 0 }, { height: 80, width: 60, x: 20, y: 150 });

    // result — a vertical (constant-x) gap line, the horizontal-overlap branch's own signature
    expect(guides.lines[0]).toMatchObject({ x1: guides.lines[0].x2 });
  });

  it('should dispatch to the diagonal branch when neither axis overlaps', () => {
    // before — target sits fully below-right, no shared range on either axis
    const guides = getDistanceGuides({ height: 100, width: 100, x: 0, y: 0 }, { height: 40, width: 50, x: 200, y: 300 });

    // result — the diagonal branch's own signature: a dashed corner bracket alongside the two solid measurements
    expect(guides.lines.filter((line) => line.dashed)).toHaveLength(2);
  });
});
