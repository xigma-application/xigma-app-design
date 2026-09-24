import { PointerEvent as ReactPointerEvent, RefObject } from 'react';

// types
import { BlendMode, EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';
import { TEffectNumberField } from '../../types';
import { TEffectPanelLayout } from '../../EffectSettingsPanel/utils/getEffectPanelLayout';

export type TUseEffectsSectionResult = {
  containerRef: RefObject<HTMLDivElement | null>;
  dropIndicatorOffset: number | null;
  effects: TEffect[];
  getLayout: (index: number) => TEffectPanelLayout;
  getMixedKeys: (index: number) => Set<keyof TEffect>;
  isHidden: (index: number) => boolean;
  isMixed: boolean;
  isRowDragging: (index: number) => boolean;
  isRowSelected: (index: number) => boolean;
  onAdd: TFunc<[EffectType]>;
  onBlendModePreview: (index: number, blendMode: BlendMode | null) => void;
  onChange: (index: number, patch: Partial<TEffect>) => void;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onFieldScrub: (index: number, field: TEffectNumberField, min: number, value: number) => void;
  onOpenChange: (index: number, isOpen: boolean) => void;
  onRemove: (index: number) => void;
  onStartDrag: (index: number, event: ReactPointerEvent) => void;
  onToggleVisible: (index: number) => void;
  openIndex: number | null;
  registerRow: (index: number) => (element: HTMLElement | null) => void;
};
