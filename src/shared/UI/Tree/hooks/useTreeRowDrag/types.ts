import { MouseEvent as ReactMouseEvent, RefObject } from 'react';

export type TArmedRowDrag = {
  indices: number[];
  startY: number;
};

export type TUseTreeRowDragOptions = {
  count: number;
  isRowSelected?: (index: number) => boolean;
  onReorder?: (fromIndices: number[], toIndex: number) => void;
  rowHeight: number;
  rowsRef: RefObject<HTMLDivElement | null>;
};

export type TUseTreeRowDragResult = {
  handleRowMouseDown: (index: number, event: ReactMouseEvent<HTMLElement>) => void;
  insertionIndex: number | null;
};
