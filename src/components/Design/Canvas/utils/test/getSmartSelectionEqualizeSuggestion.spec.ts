// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getSmartSelectionEqualizeSuggestion } from '../getSmartSelectionEqualizeSuggestion';

const node = (id: string, x: number, y: number, width = 50, height = 50): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id });

describe('getSmartSelectionEqualizeSuggestion', () => {
  it('should suggest equalizing a row whose gaps are aligned but not uniform', () => {
    const suggestion = getSmartSelectionEqualizeSuggestion([node('a', 0, 0), node('b', 90, 0), node('c', 230, 0)], 4);

    expect(suggestion?.type).toBe('equalize');
    expect(suggestion?.axis).toBe('x');
    expect(suggestion?.gapValues).toEqual([40, 90]);
    expect(suggestion?.layout.nodes.map((n) => n.id)).toEqual(['a', 'b', 'c']);
  });

  it('should suggest equalizing a column whose gaps are aligned but not uniform', () => {
    const suggestion = getSmartSelectionEqualizeSuggestion([node('a', 0, 0), node('b', 0, 90), node('c', 0, 230)], 4);

    expect(suggestion?.type).toBe('equalize');
    expect(suggestion?.axis).toBe('y');
    expect(suggestion?.gapValues).toEqual([40, 90]);
  });

  it('should return null when the gaps are already uniform within tolerance', () => {
    expect(getSmartSelectionEqualizeSuggestion([node('a', 0, 0), node('b', 100, 0), node('c', 200, 0)], 4)).toBeNull();
  });

  it('should return null with only a single gap (nothing to average)', () => {
    expect(getSmartSelectionEqualizeSuggestion([node('a', 0, 0), node('b', 200, 0)], 4)).toBeNull();
  });

  it('should return null when the nodes overlap (no valid aligned sequence)', () => {
    expect(getSmartSelectionEqualizeSuggestion([node('a', 0, 0), node('b', 20, 0), node('c', 200, 0)], 4)).toBeNull();
  });

  it('should return null when nodes are neither row- nor column-aligned', () => {
    expect(getSmartSelectionEqualizeSuggestion([node('a', 0, 0), node('b', 300, 300)], 4)).toBeNull();
  });
});
