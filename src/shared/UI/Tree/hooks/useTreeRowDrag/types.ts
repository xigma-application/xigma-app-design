import { MouseEvent as ReactMouseEvent, RefObject } from 'react';

export type TArmedRowDrag = {
  index: number;
  startY: number;
};

export type TUseTreeRowDragOptions = {
  count: number;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  rowHeight: number;
  rowsRef: RefObject<HTMLDivElement | null>;
};

export type TUseTreeRowDragResult = {
  dragIndex: number | null;
  handleRowMouseDown: (index: number, event: ReactMouseEvent<HTMLElement>) => void;
  insertionIndex: number | null;
  pointerOffsetY: number;
};
