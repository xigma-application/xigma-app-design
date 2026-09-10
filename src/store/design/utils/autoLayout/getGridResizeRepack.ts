// types
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getGridPlacementInputs } from './getGridPlacementInputs';
import { placeGridCells } from './computeGridLayoutPositions/placeGridCells/placeGridCells';

export type TGridRepackedCell = { column: number; id: string; row: number };

export type TGridResizeResolution = { ok: boolean; repacked: TGridRepackedCell[] };

export const resolveGridResize = (
  frame: TFrameNode,
  nodesById: Record<string, TSceneNode>,
  newColumnCount: number,
  capacityRowCount: number | undefined,
): TGridResizeResolution => {
  const childCount = frame.childIds.length;

  if (capacityRowCount === undefined || newColumnCount * capacityRowCount >= childCount) {
    if (frame.gridAutoPlacement === false) {
      const oldColumnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
      const inputs = getGridPlacementInputs(frame.childIds, nodesById);
      const oldPlacements = placeGridCells(inputs, oldColumnCount, false);
      const readingIndexOf = (columnStart: number, rowStart: number): number => rowStart * oldColumnCount + columnStart;
      const readingOrder = [...oldPlacements].sort(
        (a, b) => readingIndexOf(a.columnStart, a.rowStart) - readingIndexOf(b.columnStart, b.rowStart),
      );
      const inputsById = new Map(inputs.map((input) => [input.id, input]));
      const orderedInputs = readingOrder.map((placement) => inputsById.get(placement.id)!);
      const newPlacements = placeGridCells(orderedInputs, newColumnCount, true);
      const oldById = new Map(oldPlacements.map((placement) => [placement.id, placement]));

      const repacked = newPlacements
        .filter((placement) => {
          const previous = oldById.get(placement.id)!;

          return previous.columnStart !== placement.columnStart || previous.rowStart !== placement.rowStart;
        })
        .map((placement) => ({ column: placement.columnStart, id: placement.id, row: placement.rowStart }));

      return { ok: true, repacked };
    }

    return { ok: true, repacked: [] };
  }

  return { ok: false, repacked: [] };
};
