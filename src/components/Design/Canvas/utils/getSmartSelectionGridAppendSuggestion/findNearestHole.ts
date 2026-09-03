// types
import { TSmartSelectionGridLayout, TSmartSelectionNode } from 'types/design/smartSelection/types';
import { TGridAppendTarget } from './types';

// utils
import { getGridCellRect } from '../getSmartSelectionLayout/getGridCellRect';

export const findNearestHole = (outlier: TSmartSelectionNode, layout: TSmartSelectionGridLayout): TGridAppendTarget | null => {
  const outlierCenterX = outlier.bounds.x + outlier.bounds.width / 2;
  const outlierCenterY = outlier.bounds.y + outlier.bounds.height / 2;
  let nearest: (TGridAppendTarget & { distance: number }) | null = null;

  layout.cells.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (cell === null) {
        const rect = getGridCellRect(layout.geometry, rowIndex, columnIndex);
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        const distance = Math.hypot(outlierCenterX - centerX, outlierCenterY - centerY);

        if (!nearest || distance < nearest.distance) {
          nearest = { column: columnIndex, distance, height: rect.height, row: rowIndex, width: rect.width, x: rect.x, y: rect.y };
        }
      }
    });
  });

  if (nearest) {
    const { column, height, row, width, x, y } = nearest;
    return { column, height, row, width, x, y };
  }

  return null;
};
