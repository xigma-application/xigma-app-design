// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getHorizontalLayout } from '../getHorizontalLayout';

const node = (id: string, x: number, width: number, y = 0, height = 100): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id });

describe('getHorizontalLayout', () => {
  it('should accept equal gaps between nodes of different widths', () => {
    const layout = getHorizontalLayout([node('a', 0, 100), node('b', 150, 40), node('c', 240, 80)], 4);

    expect(layout?.type).toBe('row');
    expect(layout?.nodes.map((n) => n.id)).toEqual(['a', 'b', 'c']);
    expect(layout?.gaps.map((gap) => gap.value)).toEqual([50, 50]);
  });

  it('should sort nodes left-to-right regardless of input order', () => {
    const layout = getHorizontalLayout([node('b', 150, 100), node('a', 0, 100)], 4);

    expect(layout?.nodes.map((n) => n.id)).toEqual(['a', 'b']);
  });

  it('should reject unequal gaps beyond tolerance', () => {
    expect(getHorizontalLayout([node('a', 0, 100), node('b', 150, 100), node('c', 400, 100)], 4)).toBeNull();
  });

  it('should accept a gap mismatch within tolerance', () => {
    expect(getHorizontalLayout([node('a', 0, 100), node('b', 150, 100), node('c', 302, 100)], 4)).not.toBeNull();
  });

  it('should reject overlapping (negative-gap) neighbours', () => {
    expect(getHorizontalLayout([node('a', 0, 100), node('b', 80, 100)], 4)).toBeNull();
  });

  it('should reject nodes with no vertical band overlap', () => {
    expect(getHorizontalLayout([node('a', 0, 50, 0, 50), node('b', 100, 50, 200, 50)], 4)).toBeNull();
  });
});
