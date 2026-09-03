// types
import { TDraftRect } from 'types/canvas';
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';

// utils
import { getGridCellRect } from './getSmartSelectionLayout/getGridCellRect';

export type TSmartSelectionSwapSlot = {
  bounds: TDraftRect;
  id: string | null;
};

export const getSmartSelectionSwapSlots = (layout: TSmartSelectionLayout): TSmartSelectionSwapSlot[] => {
  if (layout.type === 'grid') {
    return layout.cells.flatMap((row, rowIndex) =>
      row.map((cell, columnIndex) => ({
        bounds: cell ? cell.bounds : getGridCellRect(layout.geometry, rowIndex, columnIndex),
        id: cell ? cell.id : null,
      })),
    );
  }

  return layout.nodes.map((node) => ({ bounds: node.bounds, id: node.id }));
};
