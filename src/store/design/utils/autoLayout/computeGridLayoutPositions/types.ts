// types
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';

export type TGridCellPlacement = {
  columnSpan: number;
  columnStart: number;
  id: string;
  rowSpan: number;
  rowStart: number;
};

export type TGridPlacementInput = Pick<
  TAutoLayoutChildSize,
  'gridColumnAnchorIndex' | 'gridColumnSpan' | 'gridRowAnchorIndex' | 'gridRowSpan' | 'id'
>;
