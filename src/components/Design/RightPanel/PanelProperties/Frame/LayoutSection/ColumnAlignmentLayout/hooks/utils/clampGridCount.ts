// others
import { GRID_COUNT_MAX, GRID_COUNT_MIN } from '../../GridArea/GridAreaPopover/CellsInput/constants';

export const clampGridCount = (raw: string): number | null => {
  const parsed = parseInt(raw, 10);

  if (Number.isNaN(parsed) || parsed < GRID_COUNT_MIN || parsed > GRID_COUNT_MAX) {
    return null;
  }

  return parsed;
};
