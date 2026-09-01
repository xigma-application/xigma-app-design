import { VirtualItem } from '@tanstack/react-virtual';

// types
import { TTreeItem, TTreeRow } from '../../types';

// utils
import { getTreeBackgroundSegments } from '../getTreeBackgroundSegments';

const ROW_HEIGHT = 32;

const buildRows = (ids: string[]): TTreeRow<TTreeItem>[] =>
  ids.map((id) => ({ canHaveChildren: false, depth: 0, hasChildren: false, isExpanded: false, item: { id }, parentItem: null }));

const buildItems = (count: number): VirtualItem[] =>
  Array.from({ length: count }, (_, index) => ({
    end: index * ROW_HEIGHT + ROW_HEIGHT,
    index,
    key: index,
    lane: 0,
    size: ROW_HEIGHT,
    start: index * ROW_HEIGHT,
  }));

describe('getTreeBackgroundSegments', () => {
  it('should return empty segment lists when neither predicate is provided', () => {
    // action
    const result = getTreeBackgroundSegments(buildItems(3), buildRows(['a', 'b', 'c']));

    // result
    expect(result).toEqual({ highlightBackgroundSegments: [], selectionBackgroundSegments: [] });
  });

  it('should build only selection segments when isRowHighlighted is absent', () => {
    // action
    const result = getTreeBackgroundSegments(buildItems(3), buildRows(['a', 'b', 'c']), (item) => item.id === 'b');

    // result
    expect(result.selectionBackgroundSegments).toHaveLength(1);
    expect(result.highlightBackgroundSegments).toEqual([]);
  });

  it('should square the edge where a selection block meets a highlight block', () => {
    // mock — row 0 selected (the group), rows 1-2 highlighted (its children)
    const result = getTreeBackgroundSegments(
      buildItems(4),
      buildRows(['g', 'c1', 'c2', 'other']),
      (item) => item.id === 'g',
      (item) => item.id === 'c1' || item.id === 'c2',
    );

    // result — the two blocks abut: selection squared on the bottom, highlight squared on the top
    expect(result.selectionBackgroundSegments[0].isRoundedBottom).toBe(false);
    expect(result.highlightBackgroundSegments[0].isRoundedTop).toBe(false);
  });
});
