// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getGridColumnCount } from './getGridColumnCount';
import { getGridRows } from './getGridRows';
import { getModeGap } from './getModeGap';

const sumBefore = (sizes: number[], count: number): number => sizes.slice(0, count).reduce((sum, size) => sum + size, 0);

const getHorizontalGaps = (rects: TDraftRect[], rows: number[][]): number[] =>
  rows.flatMap((row) => row.slice(1).map((index, position) => rects[index].x - (rects[row[position]].x + rects[row[position]].width)));

const getVerticalGaps = (rects: TDraftRect[], rows: number[][]): number[] =>
  rows
    .slice(1)
    .map(
      (row, position) =>
        Math.min(...row.map((index) => rects[index].y)) - Math.max(...rows[position].map((index) => rects[index].y + rects[index].height)),
    );

const getColumnWidths = (rects: TDraftRect[], cells: { column: number; index: number }[], columnCount: number): number[] =>
  Array.from({ length: columnCount }, (_, column) =>
    Math.max(0, ...cells.filter((cell) => cell.column === column).map((cell) => rects[cell.index].width)),
  );

const getRowHeights = (rects: TDraftRect[], cells: { index: number; row: number }[], rowCount: number): number[] =>
  Array.from({ length: rowCount }, (_, row) =>
    Math.max(0, ...cells.filter((cell) => cell.row === row).map((cell) => rects[cell.index].height)),
  );

export const getGridTidyTargets = (rects: TDraftRect[]): TPoint[] => {
  const detectedRows = getGridRows(rects);
  const horizontalGaps = getHorizontalGaps(rects, detectedRows);
  const verticalGaps = getVerticalGaps(rects, detectedRows);
  const gap = getModeGap([...horizontalGaps, ...verticalGaps]);
  const columnCount = getGridColumnCount(detectedRows.map((row) => row.length));
  const order = detectedRows.flat();
  const cells = order.map((index, position) => ({ column: position % columnCount, index, row: Math.floor(position / columnCount) }));
  const rowCount = Math.ceil(order.length / columnCount);
  const columnWidths = getColumnWidths(rects, cells, columnCount);
  const rowHeights = getRowHeights(rects, cells, rowCount);
  const originX = Math.min(...rects.map((rect) => rect.x));
  const originY = Math.min(...rects.map((rect) => rect.y));
  const targets: TPoint[] = rects.map((rect) => ({ x: rect.x, y: rect.y }));

  cells.forEach(({ column, index, row }) => {
    targets[index] = {
      x: originX + sumBefore(columnWidths, column) + column * gap,
      y: originY + sumBefore(rowHeights, row) + row * gap,
    };
  });

  return targets;
};
