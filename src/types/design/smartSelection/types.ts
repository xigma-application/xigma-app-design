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

export type TGridGeometry = {
  columnWidth: number[];
  columnX: number[];
  rowHeight: number[];
  rowY: number[];
};

export type TSmartSelectionGridLayout = {
  cells: (TSmartSelectionNode | null)[][];
  columnCount: number;
  columnGaps: TSmartSelectionGap[];
  geometry: TGridGeometry;
  rowCount: number;
  rowGaps: TSmartSelectionGap[];
  type: 'grid';
};

export type TSmartSelectionLayout = TSmartSelectionColumnLayout | TSmartSelectionGridLayout | TSmartSelectionRowLayout;

export type TSmartSelectionEqualizeSuggestion = {
  axis: 'x' | 'y';
  gapValues: number[];
  layout: TSmartSelectionColumnLayout | TSmartSelectionRowLayout;
  type: 'equalize';
};

export type TSmartSelectionAppendSuggestion = {
  axis: 'x' | 'y';
  insertAt: 'end' | 'start';
  layout: TSmartSelectionColumnLayout | TSmartSelectionRowLayout;
  outlierId: string;
  type: 'append';
};

export type TSmartSelectionSuggestion = TSmartSelectionAppendSuggestion | TSmartSelectionEqualizeSuggestion;
