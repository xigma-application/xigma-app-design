import { PointerEvent as ReactPointerEvent, RefObject } from 'react';

// types
import { TFillSelectModifiers } from './hooks/useFillSelection/useFillSelection';
import { TPaint } from 'types/design/paint/types';

export type TUseFillSectionResult = {
  containerRef: RefObject<HTMLDivElement | null>;
  dropIndicatorOffset: number | null;
  fills: TPaint[];
  isRowDragging: (index: number) => boolean;
  isRowSelected: (index: number) => boolean;
  onAdd: TFunc;
  onChange: (index: number, paint: TPaint) => void;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onRemove: (index: number) => void;
  onSelectRow: (index: number, modifiers: TFillSelectModifiers) => void;
  onStartDrag: (index: number, event: ReactPointerEvent) => void;
  onToggleVisible: (index: number) => void;
  registerRow: (index: number) => (element: HTMLElement | null) => void;
};
