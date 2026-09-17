import { FocusEvent } from 'react';

// others
import { IMAGE_FILL_MAX_TILE_SCALE, IMAGE_FILL_MIN_TILE_SCALE } from 'constant/canvas';

// utils
import { clamp } from 'utils/math/clamp';

export const useCommitTileScalePercent = (onTileScaleChange?: TFunc<[number]>): TFunc<[FocusEvent<HTMLInputElement>]> => {
  return (event): void => {
    const raw = event.target.value.replace('%', '').trim();
    const parsed = Number(raw);

    if (onTileScaleChange && raw !== '' && !Number.isNaN(parsed)) {
      onTileScaleChange(clamp(parsed / 100, IMAGE_FILL_MIN_TILE_SCALE, IMAGE_FILL_MAX_TILE_SCALE));
    }
  };
};
