// utils
import { getFillReorderResult } from '../getFillReorderResult';

const paint = (color: string): { color: string; opacity: number; type: 'solid' } => ({ color, opacity: 100, type: 'solid' });

describe('getFillReorderResult', () => {
  it('should move a single item past a later row', () => {
    const fills = [paint('a'), paint('b'), paint('c')];

    // insertion slot 3, grabbed index 0 -> lands at the end
    const result = getFillReorderResult(fills, [0], 3);

    expect(result.fills).toEqual([paint('b'), paint('c'), paint('a')]);
    expect(result.selectedIndices).toEqual([2]);
  });

  it('should move a contiguous multi-selection together, preserving relative order', () => {
    const fills = [paint('a'), paint('b'), paint('c'), paint('d')];

    // drag [0, 1] down past row 3
    const result = getFillReorderResult(fills, [0, 1], 4);

    expect(result.fills).toEqual([paint('c'), paint('d'), paint('a'), paint('b')]);
    expect(result.selectedIndices).toEqual([2, 3]);
  });

  it('should move a non-contiguous multi-selection together, preserving relative order', () => {
    const fills = [paint('a'), paint('b'), paint('c'), paint('d')];

    // drag [0, 2] (a and c) down to the end
    const result = getFillReorderResult(fills, [0, 2], 4);

    expect(result.fills).toEqual([paint('b'), paint('d'), paint('a'), paint('c')]);
    expect(result.selectedIndices).toEqual([2, 3]);
  });

  it('should be a no-op when dropped back onto its own slot', () => {
    const fills = [paint('a'), paint('b'), paint('c')];

    const result = getFillReorderResult(fills, [1], 1);

    expect(result.fills).toEqual(fills);
    expect(result.selectedIndices).toEqual([1]);
  });
});
