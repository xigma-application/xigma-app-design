import { PointerEvent as ReactPointerEvent, RefObject } from 'react';

// types
import { TLayoutGuide } from 'types/design/types';
import { TLayoutGuideNumberField } from 'utils/design/layoutGuides/getLayoutGuideFieldValue';

export type TUseLayoutGuideSectionResult = {
  containerRef: RefObject<HTMLDivElement | null>;
  dropIndicatorOffset: number | null;
  getMixedKeys: (index: number) => Set<keyof TLayoutGuide>;
  guides: TLayoutGuide[];
  isHidden: (index: number) => boolean;
  isMixed: boolean;
  isRowDragging: (index: number) => boolean;
  isRowSelected: (index: number) => boolean;
  isStretchedOnAny: (index: number) => boolean;
  onAdd: TFunc;
  onChange: (index: number, patch: Partial<TLayoutGuide>) => void;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onFieldScrub: (index: number, field: TLayoutGuideNumberField, min: number, value: number) => void;
  onOpenChange: (index: number, isOpen: boolean) => void;
  onRemove: (index: number) => void;
  onSelectRow: (index: number) => void;
  onStartDrag: (index: number, event: ReactPointerEvent) => void;
  onToggleVisible: (index: number) => void;
  openIndex: number | null;
  registerRow: (index: number) => (element: HTMLElement | null) => void;
};
