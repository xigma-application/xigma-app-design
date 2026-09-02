// types
import { TDraftRect, TLineSegment, TPoint } from 'types/canvas';

export type TSmartSelectionNode = {
  bounds: TDraftRect;
  id: string;
};

export type TSmartSelectionGap = {
  index: number;
  midpoint: TPoint;
  span: TLineSegment;
  value: number;
};

export type TSmartSelectionRowLayout = {
  gaps: TSmartSelectionGap[];
  nodes: TSmartSelectionNode[];
  type: 'row';
};

export type TSmartSelectionColumnLayout = {
  gaps: TSmartSelectionGap[];
  nodes: TSmartSelectionNode[];
  type: 'column';
};

export type TSmartSelectionGridLayout = {
  cells: TSmartSelectionNode[][];
  columnCount: number;
  columnGaps: TSmartSelectionGap[];
  rowCount: number;
  rowGaps: TSmartSelectionGap[];
  type: 'grid';
};

export type TSmartSelectionLayout = TSmartSelectionColumnLayout | TSmartSelectionGridLayout | TSmartSelectionRowLayout;
