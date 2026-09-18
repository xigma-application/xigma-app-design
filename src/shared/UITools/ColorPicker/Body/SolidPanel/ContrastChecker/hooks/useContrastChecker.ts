import { useState } from 'react';

// others
import { DEFAULT_CONTRAST_CHECKER_STATE } from '../constants';
import { getContrastBoundaries } from '../utils/getContrastBoundaries';
import { getContrastThreshold } from '../utils/getContrastThreshold';
import { getContrastRatio } from 'utils/color/getContrastRatio';
import { getNearestPassingHsv } from '../utils/getNearestPassingHsv';
import { getRelativeLuminance } from 'utils/color/getRelativeLuminance';
import { hexToRgb } from 'utils/color/hexToRgb';
import { hsvToRgb } from '../../../../utils/hsvToRgb';
import { truncateContrastRatio } from 'utils/color/truncateContrastRatio';

// types
import { ContrastCategory, ContrastLevel } from '../enums';
import { TContrastBoundary, TContrastCheckerState } from '../types';
import { THsv } from '../../../../types';

export type TUseContrastCheckerResult = {
  boundaries: TContrastBoundary[];
  canShowAAA: boolean;
  category: ContrastCategory;
  isActive: boolean;
  level: ContrastLevel;
  onAutoCorrect: TFunc;
  onSetCategory: TFunc<[ContrastCategory]>;
  onSetLevel: TFunc<[ContrastLevel]>;
  onToggleActive: TFunc;
  passes: boolean;
  ratio: number | null;
};

export const useContrastChecker = (
  hsv: THsv,
  backgroundColor: string | null | undefined,
  onCorrect: TFunc<[THsv]>,
): TUseContrastCheckerResult => {
  const [state, setState] = useState<TContrastCheckerState>(DEFAULT_CONTRAST_CHECKER_STATE);
  const backgroundLuminance = backgroundColor ? getRelativeLuminance(hexToRgb(backgroundColor)) : null;
  const threshold = getContrastThreshold(state.category, state.level);
  const ratio = backgroundColor ? truncateContrastRatio(getContrastRatio(hsvToRgb(hsv), hexToRgb(backgroundColor))) : null;

  return {
    boundaries: backgroundLuminance !== null ? getContrastBoundaries(hsv.h, backgroundLuminance, threshold) : [],
    canShowAAA: state.category === ContrastCategory.normalText || state.category === ContrastCategory.largeText,
    category: state.category,
    isActive: state.isActive,
    level: state.level,
    onAutoCorrect: (): void => {
      const corrected = backgroundLuminance !== null ? getNearestPassingHsv(hsv, backgroundLuminance, threshold) : null;

      if (corrected) {
        onCorrect(corrected);
      }
    },
    onSetCategory: (category: ContrastCategory): void => setState((previous) => ({ ...previous, category })),
    onSetLevel: (level: ContrastLevel): void => setState((previous) => ({ ...previous, level })),
    onToggleActive: (): void => setState((previous) => ({ ...previous, isActive: !previous.isActive })),
    passes: ratio !== null && ratio >= threshold,
    ratio,
  };
};
