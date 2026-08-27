// others
import { SAMPLE_GRID_MIDDLE_INDEX } from '../../constants';

// types
import { TRgba } from 'types/color';

// utils
import { rgbToHex } from 'utils/color/rgbToHex';

export const usePickSampledColor = (colors: TRgba[], onPick: TFunc<[string]>): TFunc => {
  const { b, g, r } = colors[SAMPLE_GRID_MIDDLE_INDEX] ?? { a: 0, b: 0, g: 0, r: 0 };

  return (): void => onPick(rgbToHex({ b, g, r }));
};
