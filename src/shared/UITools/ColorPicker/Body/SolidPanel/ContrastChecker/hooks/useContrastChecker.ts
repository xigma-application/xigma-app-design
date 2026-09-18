import { useState } from 'react';

// others
import { contrastCheckerStateCache } from '../utils/contrastCheckerStateCache';
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
import { TContrastBoundary, TContrastCheckerState, TContrastUnsupportedReason } from '../types';
import { THsv } from '../../../../types';

export type TUseContrastCheckerResult = {
  backgroundColor: string | null;
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
  unsupportedReason: TContrastUnsupportedReason | null;
};

export const useContrastChecker = (
  hsv: THsv,
  backgroundColor: string | null | undefined,
  onCorrect: TFunc<[THsv]>,
  unsupportedReason: TContrastUnsupportedReason | undefined = undefined,
): TUseContrastCheckerResult => {
  const [state, setState] = useState<TContrastCheckerState>(contrastCheckerStateCache.current);
  const updateState = (patch: Partial<TContrastCheckerState>): void => {
    contrastCheckerStateCache.current = { ...contrastCheckerStateCache.current, ...patch };
    setState(contrastCheckerStateCache.current);
  };
  const isSupported = unsupportedReason === undefined;
  const backgroundLuminance = backgroundColor && isSupported ? getRelativeLuminance(hexToRgb(backgroundColor)) : null;
  const threshold = getContrastThreshold(state.category, state.level);
  const ratio = backgroundColor && isSupported ? truncateContrastRatio(getContrastRatio(hsvToRgb(hsv), hexToRgb(backgroundColor))) : null;

  return {
    backgroundColor: backgroundColor ?? null,
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
    onSetCategory: (category: ContrastCategory): void => updateState({ category }),
    onSetLevel: (level: ContrastLevel): void => updateState({ level }),
    onToggleActive: (): void => updateState({ isActive: !contrastCheckerStateCache.current.isActive }),
    passes: ratio !== null && ratio >= threshold,
    ratio,
    unsupportedReason: unsupportedReason ?? null,
  };
};
