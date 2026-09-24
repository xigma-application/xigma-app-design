import { PointerEvent as ReactPointerEvent, RefObject } from 'react';

// types
import { TExportSetting, TExportTarget } from '../../types';

export type TUseExportSectionResult = {
  containerRef: RefObject<HTMLDivElement | null>;
  dropIndicatorOffset: number | null;
  exportTarget: TExportTarget;
  exportTargets: TExportTarget[];
  isRowDragging: (index: number) => boolean;
  isRowSelected: (index: number) => boolean;
  onAdd: TFunc;
  onChange: (index: number, next: TExportSetting) => void;
  onRemove: (index: number) => void;
  onSelectRow: (index: number) => void;
  onStartDrag: (index: number, event: ReactPointerEvent) => void;
  registerRow: (index: number) => (element: HTMLElement | null) => void;
  settings: TExportSetting[];
  zipName: string;
};
