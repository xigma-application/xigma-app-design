// types
import { TGridCellPlacement } from 'store/design/utils/autoLayout/computeGridLayoutPositions/types';
import { TGridReadingEntry } from './types';

export const getExistingReadingOrder = (placements: TGridCellPlacement[], columnCount: number): TGridReadingEntry[] =>
  placements
    .map((placement) => ({ id: placement.id, readingIndex: placement.rowStart * columnCount + placement.columnStart }))
    .sort((a, b) => a.readingIndex - b.readingIndex);
