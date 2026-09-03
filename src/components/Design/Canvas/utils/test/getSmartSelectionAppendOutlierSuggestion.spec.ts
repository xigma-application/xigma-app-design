// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getSmartSelectionAppendOutlierSuggestion } from '../getSmartSelectionAppendOutlierSuggestion';

const node = (id: string, x: number, y: number, width = 50, height = 50): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id });

describe('getSmartSelectionAppendOutlierSuggestion', () => {
  it('should treat a spatial outlier past the end of a clean row as appended at the end', () => {
    const suggestion = getSmartSelectionAppendOutlierSuggestion(
      [node('a', 0, 0), node('b', 100, 0), node('c', 200, 0), node('d', 400, 300)],
      4,
    );

    expect(suggestion?.type).toBe('append');
    expect(suggestion?.axis).toBe('x');
    expect(suggestion?.outlierId).toBe('d');
    expect(suggestion?.insertAt).toBe('end');
    expect(suggestion?.layout.nodes.map((n) => n.id)).toEqual(['a', 'b', 'c']);
  });

  it('should treat a spatial outlier before the start of a clean row as appended at the start', () => {
    const suggestion = getSmartSelectionAppendOutlierSuggestion(
      [node('a', 200, 0), node('b', 300, 0), node('c', 400, 0), node('d', 0, 300)],
      4,
    );

    expect(suggestion?.outlierId).toBe('d');
    expect(suggestion?.insertAt).toBe('start');
  });

  it('should detect a clean column with an outlier', () => {
    const suggestion = getSmartSelectionAppendOutlierSuggestion(
      [node('a', 0, 0), node('b', 0, 100), node('c', 0, 200), node('d', 300, 400)],
      4,
    );

    expect(suggestion?.axis).toBe('y');
    expect(suggestion?.outlierId).toBe('d');
  });

  it('should break a tie between two equally valid exclusions by the lexicographically smaller outlier id', () => {
    // 4 nodes evenly spaced (gap 50): excluding either endpoint leaves a valid uniform row
    const suggestion = getSmartSelectionAppendOutlierSuggestion(
      [node('aaa', 0, 0), node('m1', 100, 0), node('m2', 200, 0), node('zzz', 300, 0)],
      4,
    );

    expect(suggestion?.outlierId).toBe('aaa');
  });

  it('should return null when no single exclusion yields a valid layout', () => {
    expect(getSmartSelectionAppendOutlierSuggestion([node('a', 0, 0), node('b', 500, 500), node('c', 1000, 1000)], 4)).toBeNull();
  });

  it('should return null when the remainder after excluding a node is too small to form a layout', () => {
    expect(getSmartSelectionAppendOutlierSuggestion([node('a', 0, 0), node('b', 500, 500)], 4)).toBeNull();
  });
});
