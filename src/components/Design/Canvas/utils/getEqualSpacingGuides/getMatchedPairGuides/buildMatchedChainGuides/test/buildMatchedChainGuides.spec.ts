// utils
import { buildMatchedChainGuides } from '../buildMatchedChainGuides';
import { getEdges } from '../../../../getDistanceGuides/getEdges';

const rect = (y: number): ReturnType<typeof getEdges> => getEdges({ height: 100, width: 200, x: 0, y });

describe('buildMatchedChainGuides', () => {
  it('should span the whole vertical chain and label every gap in an equal run', () => {
    // mock — 4 shapes, equal 50px gaps, active is the bottom one
    const chain = [rect(0), rect(150), rect(300), rect(450)];
    const active = chain[3];

    // action
    const guides = buildMatchedChainGuides(active, chain, 'vertical', 0.5);

    // result
    expect(guides.lines).toEqual([
      { dashed: false, x1: 100, x2: 100, y1: 500, y2: 0 }, // centre: active centre up to the chain's far edge
      { dashed: false, x1: 0, x2: 0, y1: 0, y2: 550 }, // left edge, full chain
      { dashed: false, x1: 200, x2: 200, y1: 0, y2: 550 }, // right edge, full chain
    ]);
    expect(guides.labels).toHaveLength(3);
    expect(guides.labels.every((label) => label.text === '50')).toBe(true);
  });

  it('should not label a gap that is not part of an equal run', () => {
    // mock — 3 shapes with a 50px then a 90px gap (neither equal to the other)
    const chain = [rect(0), rect(150), rect(340)];
    const active = chain[2];

    // action
    const guides = buildMatchedChainGuides(active, chain, 'vertical', 0.5);

    // result
    expect(guides.labels).toHaveLength(0);
  });

  it('should run the centre line through the whole chain when active is in the middle', () => {
    // mock — active is chain[1] of 3
    const chain = [rect(0), rect(150), rect(300)];
    const active = chain[1];

    // action
    const guides = buildMatchedChainGuides(active, chain, 'vertical', 0.5);

    // result — active centre y:200, more shapes below (index 1, 3-1-1=1, 1>=1 true → far = near edge = 0)
    expect(guides.lines[0]).toEqual({ dashed: false, x1: 100, x2: 100, y1: 200, y2: 0 });
  });

  it('should mirror onto the horizontal axis', () => {
    // mock — 3 shapes stacked left→right, equal 50px gaps
    const hrect = (x: number): ReturnType<typeof getEdges> => getEdges({ height: 200, width: 100, x, y: 0 });
    const chain = [hrect(0), hrect(150), hrect(300)];
    const active = chain[2];

    // action
    const guides = buildMatchedChainGuides(active, chain, 'horizontal', 0.5);

    // result — centre line is horizontal, edges are horizontal
    expect(guides.lines[0]).toEqual({ dashed: false, x1: 350, x2: 0, y1: 100, y2: 100 });
    expect(guides.labels).toHaveLength(2);
  });
});
