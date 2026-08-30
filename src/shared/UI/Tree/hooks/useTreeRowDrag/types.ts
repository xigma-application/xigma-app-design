import { MouseEvent as ReactMouseEvent, RefObject } from 'react';

// types
import { TTreeItem, TTreeRow } from '../../types';

export type TArmedRowDrag = {
  depth: number;
  indices: number[];
  startY: number;
};

export type TTreeDragState = {
  armedRef: RefObject<TArmedRowDrag | null>;
  dropDepth: number;
  insertionIndex: number | null;
  setDropDepth: (depth: number) => void;
  setInsertionIndex: (index: number | null) => void;
};

export type TUseTreeRowDragOptions<T extends TTreeItem> = {
  isRowSelected?: (item: T) => boolean;
  onReorder?: (draggedItems: T[], targetParentItem: T | null, targetIndex: number) => void;
  rows: TTreeRow<T>[];
  rowHeight: number;
  rowsRef: RefObject<HTMLDivElement | null>;
};

export type TUseTreeRowDragResult = {
  dropDepth: number;
  handleRowMouseDown: (index: number, event: ReactMouseEvent<HTMLElement>) => void;
  insertionIndex: number | null;
};
