import { PointerEvent as ReactPointerEvent, RefObject } from 'react';

// types
import { TFillSelectModifiers } from './hooks/useFillSelection/useFillSelection';
import { TImageFillMode } from 'shared/UITools/ColorPicker/Body/ImagePanel/types';
import { TPaint } from 'types/design/paint/types';

export type TUseFillSectionResult = {
  containerRef: RefObject<HTMLDivElement | null>;
  disabledFillModes: TImageFillMode[] | undefined;
  dropIndicatorOffset: number | null;
  fills: TPaint[];
  isRowDragging: (index: number) => boolean;
  isMixed: boolean;
  isRowSelected: (index: number) => boolean;
  nodeId: string | undefined;
  nodeIds: string[];
  onAdd: TFunc;
  onChange: (index: number, paint: TPaint) => void;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onPickerOpenChange: (index: number, isOpen: boolean) => void;
  onRemove: (index: number) => void;
  onSelectRow: (index: number, modifiers: TFillSelectModifiers) => void;
  onStartDrag: (index: number, event: ReactPointerEvent) => void;
  onToggleVisible: (index: number) => void;
  openPickerIndex: number | null;
  registerRow: (index: number) => (element: HTMLElement | null) => void;
};
