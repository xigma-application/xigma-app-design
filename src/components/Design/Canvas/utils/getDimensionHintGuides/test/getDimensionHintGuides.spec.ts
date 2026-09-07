// utils
import { getDimensionHintGuides } from '../getDimensionHintGuides';

// types
import { TDimensionHintFrame } from '../types';

const baseFrame: TDimensionHintFrame = { height: 200, width: 300, x: 100, y: 50 };

describe('getDimensionHintGuides', () => {
  it('should draw only the right-edge line for width when no bounds are set', () => {
    const guides = getDimensionHintGuides(baseFrame, 'width');

    expect(guides.lines).toEqual([{ color: 'blue', x1: 400, x2: 400, y1: 50, y2: 250 }]);
    expect(guides.labels).toEqual([]);
  });

  it('should draw the bottom-edge line for height when no bounds are set', () => {
    const guides = getDimensionHintGuides(baseFrame, 'height');

    expect(guides.lines).toEqual([{ color: 'blue', x1: 100, x2: 400, y1: 250, y2: 250 }]);
  });

  it('should add the min-width guide and its label under the frame on a width hover', () => {
    const guides = getDimensionHintGuides({ ...baseFrame, minWidth: 156 }, 'width');

    expect(guides.lines).toContainEqual({ color: 'red', x1: 256, x2: 256, y1: 50, y2: 250 });
    expect(guides.labels).toEqual([{ anchor: { x: 256, y: 250 }, color: 'red', offsetDirection: { x: 0, y: 1 }, text: 'Min W 156' }]);
  });

  it('should draw only the min-width guide on a minWidth hover', () => {
    const guides = getDimensionHintGuides({ ...baseFrame, maxWidth: 500, minWidth: 156 }, 'minWidth');

    expect(guides.lines).toEqual([{ color: 'red', x1: 256, x2: 256, y1: 50, y2: 250 }]);
    expect(guides.labels.map((label) => label.text)).toEqual(['Min W 156']);
  });

  it('should draw the min-width guide regardless of whether the current width already exceeds it', () => {
    const guides = getDimensionHintGuides({ ...baseFrame, minWidth: 320, width: 300 }, 'minWidth');

    expect(guides.lines).toEqual([{ color: 'red', x1: 420, x2: 420, y1: 50, y2: 250 }]);
  });

  it('should build the max-width bracket (vertical line + two arrowed dashed connectors) when width is below max', () => {
    const guides = getDimensionHintGuides({ ...baseFrame, maxWidth: 500 }, 'maxWidth');

    expect(guides.lines).toEqual([
      { color: 'red', x1: 600, x2: 600, y1: 50, y2: 250 },
      { arrowAtEnd: true, color: 'blue', dashed: true, x1: 400, x2: 600, y1: 50, y2: 50 },
      { arrowAtEnd: true, color: 'blue', dashed: true, x1: 400, x2: 600, y1: 250, y2: 250 },
    ]);
    expect(guides.labels).toEqual([{ anchor: { x: 600, y: 150 }, color: 'red', offsetDirection: { x: 1, y: 0 }, text: 'Max W 500' }]);
  });

  it('should draw nothing for a max-width hover once the width has reached the max', () => {
    const guides = getDimensionHintGuides({ ...baseFrame, maxWidth: 300, width: 300 }, 'maxWidth');

    expect(guides).toEqual({ labels: [], lines: [] });
  });

  it('should omit the max-width bracket from a width hover once width has reached max, keeping the edge line', () => {
    const guides = getDimensionHintGuides({ ...baseFrame, maxWidth: 300, width: 300 }, 'width');

    expect(guides.lines).toEqual([{ color: 'blue', x1: 400, x2: 400, y1: 50, y2: 250 }]);
  });

  it('should extend the max-height bracket downward from the bottom edge', () => {
    const guides = getDimensionHintGuides({ ...baseFrame, maxHeight: 400 }, 'maxHeight');

    expect(guides.lines).toEqual([
      { color: 'red', x1: 100, x2: 400, y1: 450, y2: 450 },
      { arrowAtEnd: true, color: 'blue', dashed: true, x1: 100, x2: 100, y1: 250, y2: 450 },
      { arrowAtEnd: true, color: 'blue', dashed: true, x1: 400, x2: 400, y1: 250, y2: 450 },
    ]);
    expect(guides.labels).toEqual([{ anchor: { x: 250, y: 450 }, color: 'red', offsetDirection: { x: 0, y: 1 }, text: 'Max H 400' }]);
  });

  it('should place the min-height guide across the frame with its label to the right', () => {
    const guides = getDimensionHintGuides({ ...baseFrame, minHeight: 80 }, 'minHeight');

    expect(guides.lines).toEqual([{ color: 'red', x1: 100, x2: 400, y1: 130, y2: 130 }]);
    expect(guides.labels).toEqual([{ anchor: { x: 400, y: 130 }, color: 'red', offsetDirection: { x: 1, y: 0 }, text: 'Min H 80' }]);
  });

  it('should combine edge, min and max guides on a full height hover', () => {
    const guides = getDimensionHintGuides({ ...baseFrame, maxHeight: 400, minHeight: 80 }, 'height');

    expect(guides.lines).toHaveLength(1 + 1 + 3);
    expect(guides.labels.map((label) => label.text)).toEqual(['Min H 80', 'Max H 400']);
  });

  it('should round fractional bound values in the labels', () => {
    const guides = getDimensionHintGuides({ ...baseFrame, minWidth: 155.6 }, 'minWidth');

    expect(guides.labels[0].text).toBe('Min W 156');
  });

  it('should treat an explicit rotation of 0 the same as no rotation', () => {
    expect(getDimensionHintGuides({ ...baseFrame, maxWidth: 500, rotation: 0 }, 'width')).toEqual(
      getDimensionHintGuides({ ...baseFrame, maxWidth: 500 }, 'width'),
    );
  });

  it('should rotate the width-edge line about the frame centre for a rotated frame', () => {
    // 300x200 frame at (100,50) → centre (250,150); a 90° turn maps the right edge onto the bottom
    const [line] = getDimensionHintGuides({ ...baseFrame, rotation: 90 }, 'width').lines;

    expect(line.x1).toBeCloseTo(350);
    expect(line.y1).toBeCloseTo(300);
    expect(line.x2).toBeCloseTo(150);
    expect(line.y2).toBeCloseTo(300);
  });

  it('should rotate the min-width label anchor and its offset direction too', () => {
    const { labels } = getDimensionHintGuides({ ...baseFrame, minWidth: 156, rotation: 90 }, 'minWidth');

    expect(labels[0].anchor.x).toBeCloseTo(150);
    expect(labels[0].anchor.y).toBeCloseTo(156);
    expect(labels[0].offsetDirection.x).toBeCloseTo(-1);
    expect(labels[0].offsetDirection.y).toBeCloseTo(0);
    expect(labels[0].text).toBe('Min W 156');
  });

  it('should keep the dashed max-width connectors and their arrow flags through a rotation', () => {
    const { lines } = getDimensionHintGuides({ ...baseFrame, maxWidth: 500, rotation: 45 }, 'maxWidth');

    expect(lines).toHaveLength(3);
    expect(lines.filter((line) => line.dashed && line.arrowAtEnd)).toHaveLength(2);
  });
});
