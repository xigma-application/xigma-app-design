// types
import { TGradientPaint, TSolidPaint } from 'types/design/paint/types';
import { TSelectionColorGroup, TSelectionColorOccurrence } from '../../types';

export type TOpenSelectionColorGroup = { key: string; occurrences: TSelectionColorOccurrence[] };

export type TUseSelectionColorsSectionResult = {
  getSelectionCount: (occurrences: TSelectionColorOccurrence[]) => number;
  groups: TSelectionColorGroup[];
  hasChildren: boolean;
  onChange: (occurrences: TSelectionColorOccurrence[], nextPaint: TSolidPaint | TGradientPaint) => void;
  onOpenChange: (group: TSelectionColorGroup, isOpen: boolean) => void;
  onSelectNodes: (occurrences: TSelectionColorOccurrence[]) => void;
  openGroupKey: string | null;
};
