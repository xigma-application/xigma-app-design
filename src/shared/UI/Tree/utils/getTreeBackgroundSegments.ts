import { VirtualItem } from '@tanstack/react-virtual';

// types
import { TTreeItem, TTreeRow } from '../types';

// utils
import { getIsRowSelectedByIndex } from './getIsRowSelectedByIndex';
import { getSelectionBackgroundSegments, TSelectionBackgroundSegment } from './getSelectionBackgroundSegments';

export type TTreeBackgroundSegments = {
  highlightBackgroundSegments: TSelectionBackgroundSegment[];
  selectionBackgroundSegments: TSelectionBackgroundSegment[];
};

export const getTreeBackgroundSegments = <T extends TTreeItem>(
  items: VirtualItem[],
  rows: TTreeRow<T>[],
  isRowSelected?: (item: T) => boolean,
  isRowHighlighted?: (item: T) => boolean,
): TTreeBackgroundSegments => {
  const isRowSelectedByIndex = getIsRowSelectedByIndex(rows, isRowSelected);
  const isRowHighlightedByIndex = getIsRowSelectedByIndex(rows, isRowHighlighted);
  const isRowFilledByIndex = (index: number): boolean =>
    Boolean(isRowSelectedByIndex?.(index)) || Boolean(isRowHighlightedByIndex?.(index));

  return {
    highlightBackgroundSegments: isRowHighlightedByIndex
      ? getSelectionBackgroundSegments(items, isRowHighlightedByIndex, isRowFilledByIndex)
      : [],
    selectionBackgroundSegments: isRowSelectedByIndex
      ? getSelectionBackgroundSegments(items, isRowSelectedByIndex, isRowFilledByIndex)
      : [],
  };
};
