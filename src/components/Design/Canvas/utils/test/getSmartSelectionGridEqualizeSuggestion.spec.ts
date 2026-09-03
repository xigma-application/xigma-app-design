// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getSmartSelectionGridEqualizeSuggestion } from '../getSmartSelectionGridEqualizeSuggestion';

const cell = (id: string, x: number, y: number, width = 50, height = 50): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id });

describe('getSmartSelectionGridEqualizeSuggestion', () => {
  it('should equalize column gaps while row gaps are already uniform', () => {
    const nodes = [cell('a', 0, 0), cell('b', 100, 0), cell('c', 250, 0), cell('d', 0, 100), cell('e', 100, 100), cell('f', 250, 100)];

    const suggestion = getSmartSelectionGridEqualizeSuggestion(nodes, 4, 4);

    expect(suggestion?.type).toBe('grid-equalize');
    expect(suggestion?.columnGapValues).toEqual([50, 100]);
    expect(suggestion?.rowGapValues).toEqual([50]);
    expect(suggestion?.layout.type).toBe('grid');
  });

  it('should equalize row gaps while column gaps are already uniform', () => {
    const nodes = [cell('a', 0, 0), cell('b', 100, 0), cell('c', 0, 100), cell('d', 100, 100), cell('e', 0, 300), cell('f', 100, 300)];

    const suggestion = getSmartSelectionGridEqualizeSuggestion(nodes, 4, 4);

    expect(suggestion?.rowGapValues).toEqual([50, 150]);
    expect(suggestion?.columnGapValues).toEqual([50]);
  });

  it('should return null when the grid is already perfectly uniform', () => {
    const nodes = [cell('a', 0, 0), cell('b', 100, 0), cell('c', 0, 100), cell('d', 100, 100)];

    expect(getSmartSelectionGridEqualizeSuggestion(nodes, 4, 4)).toBeNull();
  });

  it('should return null when the arrangement is not grid-aligned at all', () => {
    const nodes = [cell('a', 0, 0), cell('b', 500, 500), cell('c', 1000, 1000)];

    expect(getSmartSelectionGridEqualizeSuggestion(nodes, 4, 4)).toBeNull();
  });

  it('should return null when a column overlaps (negative gap)', () => {
    const nodes = [cell('a', 0, 0), cell('b', 20, 0), cell('c', 0, 100), cell('d', 20, 100)];

    expect(getSmartSelectionGridEqualizeSuggestion(nodes, 4, 4)).toBeNull();
  });
});
