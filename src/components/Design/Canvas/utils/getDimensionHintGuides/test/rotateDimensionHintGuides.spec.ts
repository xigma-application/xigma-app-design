// utils
import { rotateDimensionHintGuides } from '../rotateDimensionHintGuides';

describe('rotateDimensionHintGuides', () => {
  it('should rotate a line about the given center', () => {
    // a horizontal line from (0,0) to (10,0), rotated 90deg about (0,0) should become vertical
    const guides = { labels: [], lines: [{ color: 'blue' as const, x1: 0, x2: 10, y1: 0, y2: 0 }] };

    const rotated = rotateDimensionHintGuides(guides, { x: 0, y: 0 }, 90);

    expect(rotated.lines[0].x1).toBeCloseTo(0);
    expect(rotated.lines[0].y1).toBeCloseTo(0);
    expect(rotated.lines[0].x2).toBeCloseTo(0);
    expect(rotated.lines[0].y2).toBeCloseTo(10);
  });

  it('should preserve non-geometric line fields untouched', () => {
    const guides = { labels: [], lines: [{ arrowAtEnd: true, color: 'blue' as const, dashed: true, x1: 0, x2: 10, y1: 0, y2: 0 }] };

    const rotated = rotateDimensionHintGuides(guides, { x: 0, y: 0 }, 45);

    expect(rotated.lines[0]).toMatchObject({ arrowAtEnd: true, color: 'blue', dashed: true });
  });

  it('should rotate a label anchor about the center and its offset direction about the origin', () => {
    const guides = {
      labels: [{ anchor: { x: 10, y: 0 }, color: 'red' as const, offsetDirection: { x: 1, y: 0 }, text: 'x' }],
      lines: [],
    };

    const rotated = rotateDimensionHintGuides(guides, { x: 0, y: 0 }, 90);

    expect(rotated.labels[0].anchor.x).toBeCloseTo(0);
    expect(rotated.labels[0].anchor.y).toBeCloseTo(10);
    expect(rotated.labels[0].offsetDirection.x).toBeCloseTo(0);
    expect(rotated.labels[0].offsetDirection.y).toBeCloseTo(1);
    expect(rotated.labels[0].text).toBe('x');
  });
});
