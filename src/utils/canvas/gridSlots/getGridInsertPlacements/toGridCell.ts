// types
import { TGridDropCell } from '../getGridDropCell';

export const toGridCell = (readingIndex: number, columnCount: number): TGridDropCell => ({
  column: readingIndex % columnCount,
  row: Math.floor(readingIndex / columnCount),
});
