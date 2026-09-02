// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getVerticalLayout } from '../getVerticalLayout';

const node = (id: string, y: number, height: number, x = 0, width = 100): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id });

describe('getVerticalLayout', () => {
  it('should accept equal gaps between nodes of different heights', () => {
    const layout = getVerticalLayout([node('a', 0, 100), node('b', 150, 40), node('c', 240, 80)], 4);

    expect(layout?.type).toBe('column');
    expect(layout?.nodes.map((n) => n.id)).toEqual(['a', 'b', 'c']);
    expect(layout?.gaps.map((gap) => gap.value)).toEqual([50, 50]);
  });

  it('should sort nodes top-to-bottom regardless of input order', () => {
    const layout = getVerticalLayout([node('b', 150, 100), node('a', 0, 100)], 4);

    expect(layout?.nodes.map((n) => n.id)).toEqual(['a', 'b']);
  });

  it('should reject unequal gaps beyond tolerance', () => {
    expect(getVerticalLayout([node('a', 0, 100), node('b', 150, 100), node('c', 400, 100)], 4)).toBeNull();
  });

  it('should accept a gap mismatch within tolerance', () => {
    expect(getVerticalLayout([node('a', 0, 100), node('b', 150, 100), node('c', 302, 100)], 4)).not.toBeNull();
  });

  it('should reject overlapping (negative-gap) neighbours', () => {
    expect(getVerticalLayout([node('a', 0, 100), node('b', 80, 100)], 4)).toBeNull();
  });

  it('should reject nodes with no horizontal band overlap', () => {
    expect(getVerticalLayout([node('a', 0, 50, 0, 50), node('b', 200, 50, 100, 50)], 4)).toBeNull();
  });
});
