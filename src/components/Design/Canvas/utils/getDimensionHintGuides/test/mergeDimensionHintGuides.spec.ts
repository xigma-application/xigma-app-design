// utils
import { mergeDimensionHintGuides } from '../mergeDimensionHintGuides';

describe('mergeDimensionHintGuides', () => {
  it('should concatenate the labels and lines of every part in order', () => {
    const a = { labels: [{ anchor: { x: 0, y: 0 }, color: 'red' as const, offsetDirection: { x: 0, y: 1 }, text: 'a' }], lines: [] };
    const b = { labels: [], lines: [{ color: 'blue' as const, x1: 0, x2: 1, y1: 0, y2: 1 }] };

    expect(mergeDimensionHintGuides(a, b)).toEqual({
      labels: a.labels,
      lines: b.lines,
    });
  });

  it('should return empty arrays when called with no parts', () => {
    expect(mergeDimensionHintGuides()).toEqual({ labels: [], lines: [] });
  });
});
