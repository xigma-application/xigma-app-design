import { VirtualItem } from '@tanstack/react-virtual';

// utils
import { getSelectionBackgroundSegments } from '../getSelectionBackgroundSegments';

const ROW_HEIGHT = 32;

const buildItems = (count: number): VirtualItem[] =>
  Array.from({ length: count }, (_, index) => ({
    end: index * ROW_HEIGHT + ROW_HEIGHT,
    index,
    key: index,
    lane: 0,
    size: ROW_HEIGHT,
    start: index * ROW_HEIGHT,
  }));

describe('getSelectionBackgroundSegments', () => {
  it('should return no segments when nothing is selected', () => {
    // mock
    const items = buildItems(3);
    const isRowSelected = (): boolean => false;

    // action & result
    expect(getSelectionBackgroundSegments(items, isRowSelected)).toEqual([]);
  });

  it('should return one rounded-on-both-ends segment for a single isolated selected row', () => {
    // mock
    const items = buildItems(3);
    const isRowSelected = (index: number): boolean => index === 1;

    // action
    const result = getSelectionBackgroundSegments(items, isRowSelected);

    // result
    expect(result).toEqual([{ isRoundedBottom: true, isRoundedTop: true, size: ROW_HEIGHT, start: ROW_HEIGHT }]);
  });

  it('should merge two adjacent selected rows into one segment spanning both', () => {
    // mock
    const items = buildItems(3);
    const isRowSelected = (index: number): boolean => index === 0 || index === 1;

    // action
    const result = getSelectionBackgroundSegments(items, isRowSelected);

    // result
    expect(result).toEqual([{ isRoundedBottom: true, isRoundedTop: true, size: ROW_HEIGHT * 2, start: 0 }]);
  });

  it('should split into two separate segments when selected rows are not adjacent', () => {
    // mock
    const items = buildItems(4);
    const isRowSelected = (index: number): boolean => index === 0 || index === 3;

    // action
    const result = getSelectionBackgroundSegments(items, isRowSelected);

    // result
    expect(result).toEqual([
      { isRoundedBottom: true, isRoundedTop: true, size: ROW_HEIGHT, start: 0 },
      { isRoundedBottom: true, isRoundedTop: true, size: ROW_HEIGHT, start: ROW_HEIGHT * 3 },
    ]);
  });

  it('should leave the top edge square when the selection continues above the visible window', () => {
    // mock — item 0 is the first VISIBLE row, but index -1 (scrolled out of view) is also selected
    const items = buildItems(2);
    const isRowSelected = (index: number): boolean => index <= 1;

    // action
    const result = getSelectionBackgroundSegments(items, isRowSelected);

    // result
    expect(result).toEqual([{ isRoundedBottom: true, isRoundedTop: false, size: ROW_HEIGHT * 2, start: 0 }]);
  });

  it('should leave the bottom edge square when the selection continues below the visible window', () => {
    // mock — index -1 (above the window) is not selected, but the row right after the last visible item is
    const items = buildItems(2);
    const isRowSelected = (index: number): boolean => index >= 0;

    // action
    const result = getSelectionBackgroundSegments(items, isRowSelected);

    // result
    expect(result).toEqual([{ isRoundedBottom: false, isRoundedTop: true, size: ROW_HEIGHT * 2, start: 0 }]);
  });

  it('should close a still-open segment that runs through the last item', () => {
    // mock
    const items = buildItems(3);
    const isRowSelected = (index: number): boolean => index >= 1;

    // action
    const result = getSelectionBackgroundSegments(items, isRowSelected);

    // result
    expect(result).toEqual([{ isRoundedBottom: false, isRoundedTop: true, size: ROW_HEIGHT * 2, start: ROW_HEIGHT }]);
  });
});
