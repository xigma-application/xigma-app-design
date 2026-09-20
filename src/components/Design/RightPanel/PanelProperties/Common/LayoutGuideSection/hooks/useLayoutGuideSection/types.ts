import { PointerEvent as ReactPointerEvent, RefObject } from 'react';

// types
import { TLayoutGuide } from 'types/design/types';

export type TUseLayoutGuideSectionResult = {
  containerRef: RefObject<HTMLDivElement | null>;
  dropIndicatorOffset: number | null;
  guides: TLayoutGuide[];
  isRowDragging: (index: number) => boolean;
  isRowSelected: (index: number) => boolean;
  onAdd: TFunc;
  onChange: (index: number, guide: TLayoutGuide) => void;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onOpenChange: (index: number, isOpen: boolean) => void;
  onRemove: (index: number) => void;
  onSelectRow: (index: number) => void;
  onStartDrag: (index: number, event: ReactPointerEvent) => void;
  onToggleVisible: (index: number) => void;
  openIndex: number | null;
  registerRow: (index: number) => (element: HTMLElement | null) => void;
};
