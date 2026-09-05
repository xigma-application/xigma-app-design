import { MouseEvent as ReactMouseEvent, RefObject } from 'react';

// types
import { TTreeItem, TTreeRow } from '../../types';

export type TArmedRowDrag = {
  depth: number;
  ids: string[];
  indices: number[];
  startY: number;
};

export type TSpringLoad = {
  itemId: string;
  timerId: number;
};

export type TTreeDragState = {
  armedRef: RefObject<TArmedRowDrag | null>;
  dropDepth: number;
  dropInsideIndex: number | null;
  insertionIndex: number | null;
  onSpringLoadExpandRef: RefObject<((itemId: string) => void) | undefined>;
  setDropDepth: (depth: number) => void;
  setDropInsideIndex: (index: number | null) => void;
  setInsertionIndex: (index: number | null) => void;
  springLoadRef: RefObject<TSpringLoad | null>;
};

export type TUseTreeRowDragOptions<T extends TTreeItem> = {
  isForwardOrderParent?: (parentItem: T | null) => boolean;
  isRowSelected?: (item: T) => boolean;
  onReorder?: (draggedItems: T[], targetParentItem: T | null, targetIndex: number) => void;
  onSpringLoadExpand?: (itemId: string) => void;
  rows: TTreeRow<T>[];
  rowHeight: number;
  rowsRef: RefObject<HTMLDivElement | null>;
};

export type TUseTreeRowDragResult = {
  dropDepth: number;
  dropInsideIndex: number | null;
  handleRowMouseDown: (index: number, event: ReactMouseEvent<HTMLElement>) => void;
  insertionIndex: number | null;
};
