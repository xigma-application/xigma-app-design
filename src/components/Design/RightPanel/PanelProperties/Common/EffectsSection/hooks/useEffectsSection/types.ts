import { PointerEvent as ReactPointerEvent, RefObject } from 'react';

// types
import { EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';

export type TUseEffectsSectionResult = {
  containerRef: RefObject<HTMLDivElement | null>;
  dropIndicatorOffset: number | null;
  effects: TEffect[];
  isRowDragging: (index: number) => boolean;
  isRowSelected: (index: number) => boolean;
  onAdd: TFunc<[EffectType]>;
  onChange: (index: number, effect: TEffect) => void;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onOpenChange: (index: number, isOpen: boolean) => void;
  onRemove: (index: number) => void;
  onStartDrag: (index: number, event: ReactPointerEvent) => void;
  onToggleVisible: (index: number) => void;
  openIndex: number | null;
  registerRow: (index: number) => (element: HTMLElement | null) => void;
};
