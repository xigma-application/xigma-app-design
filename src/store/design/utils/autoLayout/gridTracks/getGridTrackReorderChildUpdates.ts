// types
import { TGridTrackChild, TGridTrackReorderResult } from './types';

type TMappedChild = {
  cells: number[];
  id: string;
};

const mapChildCells = (child: TGridTrackChild, newIndexByOld: number[]): TMappedChild | null => {
  const anchor = child.anchorIndex ?? -1;
  const span = Math.max(Math.round(child.span), 1);

  switch (true) {
    case anchor < 0:
    case anchor + span > newIndexByOld.length:
      return null;
    default: {
      const cells = Array.from({ length: span }, (_unused, offset) => newIndexByOld[anchor + offset]).sort((left, right) => left - right);
      return { cells, id: child.id };
    }
  }
};

export const getGridTrackReorderChildUpdates = (children: TGridTrackChild[], newIndexByOld: number[]): TGridTrackReorderResult => {
  const mapped = children.map((child) => mapChildCells(child, newIndexByOld)).filter((entry): entry is TMappedChild => entry !== null);
  const broken = mapped.some(({ cells }) => cells.some((cell, index) => index > 0 && cell !== cells[index - 1] + 1));

  if (broken) {
    return { ok: false, updates: [] };
  }

  return { ok: true, updates: mapped.map(({ cells, id }) => ({ anchorIndex: cells[0], id })) };
};
