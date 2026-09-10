// types
import { TGridDropCell } from '../getGridDropCell';

export type TGridShiftedPlacement = {
  cell: TGridDropCell;
  id: string;
};

export type TGridInsertPlacements = {
  dragged: TGridDropCell[];
  shifted: TGridShiftedPlacement[];
};

export type TGridReadingEntry = {
  id: string;
  readingIndex: number;
};
