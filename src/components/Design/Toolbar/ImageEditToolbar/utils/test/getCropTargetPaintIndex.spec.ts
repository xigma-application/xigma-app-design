// utils
import { getCropTargetPaintIndex } from '../getCropTargetPaintIndex';

// types
import { TPaint } from 'types/design/paint/types';

const solid: TPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
const image: TPaint = { opacity: 100, ref: '', rotation: 0, scaleMode: 'fill', type: 'image' };

describe('getCropTargetPaintIndex', () => {
  it('(a) should pick the first image fill from the top when nothing is selected', () => {
    const fills = [solid, image, solid, image];

    expect(getCropTargetPaintIndex(fills, [])).toBe(1);
  });

  it('(b) should pick the selected fill when it is the image one', () => {
    const fills = [solid, image, image];

    expect(getCropTargetPaintIndex(fills, [2])).toBe(2);
  });

  it('(b) should pick the selected image fill even when several fills are selected', () => {
    const fills = [image, solid, image];

    expect(getCropTargetPaintIndex(fills, [1, 2])).toBe(2);
  });

  it('(c) should fall back to the first image fill from the top when the selection has no image fill', () => {
    const fills = [solid, image, image];

    expect(getCropTargetPaintIndex(fills, [0])).toBe(1);
  });

  it('should return -1 when there is no image fill at all', () => {
    const fills = [solid, solid];

    expect(getCropTargetPaintIndex(fills, [])).toBe(-1);
    expect(getCropTargetPaintIndex(fills, [0])).toBe(-1);
  });

  it('(d) should pick the currently open picker fill when the selection has no image fill', () => {
    const fills = [image, solid, image];

    expect(getCropTargetPaintIndex(fills, [], 2)).toBe(2);
  });

  it('(d) should ignore the open picker index when it does not point at an image fill', () => {
    const fills = [image, solid, image];

    expect(getCropTargetPaintIndex(fills, [], 1)).toBe(0);
  });

  it('(d) should prefer the open picker index over an explicitly selected image fill', () => {
    const fills = [image, solid, image];

    expect(getCropTargetPaintIndex(fills, [0], 2)).toBe(2);
  });
});
