import { PointerEvent as ReactPointerEvent, RefObject } from 'react';

// types
import { TExportSetting } from '../../types';
import { TSceneNode } from 'types/design/types';

export type TUseExportSectionResult = {
  containerRef: RefObject<HTMLDivElement | null>;
  dropIndicatorOffset: number | null;
  isRowDragging: (index: number) => boolean;
  isRowSelected: (index: number) => boolean;
  node: TSceneNode | undefined;
  onAdd: TFunc;
  onChange: (index: number, next: TExportSetting) => void;
  onRemove: (index: number) => void;
  onSelectRow: (index: number) => void;
  onStartDrag: (index: number, event: ReactPointerEvent) => void;
  registerRow: (index: number) => (element: HTMLElement | null) => void;
  settings: TExportSetting[];
};
