import { useState } from 'react';

// others
import { applyContrastCorrection } from '../utils/applyContrastCorrection';
import { contrastCheckerStateCache } from '../utils/contrastCheckerStateCache';
import { getContrastBoundaries } from '../utils/getContrastBoundaries';
import { getContrastThreshold } from '../utils/getContrastThreshold';
import { getContrastRatio } from 'utils/color/getContrastRatio';
import { getCorrectionTarget } from '../utils/getCorrectionTarget';
import { getRelativeLuminance } from 'utils/color/getRelativeLuminance';
import { hexToRgb } from 'utils/color/hexToRgb';
import { hsvToRgb } from '../../../../utils/hsvToRgb';
import { truncateContrastRatio } from 'utils/color/truncateContrastRatio';
import { updateContrastCheckerState } from '../utils/updateContrastCheckerState';

// types
import { ContrastCategory, ContrastLevel } from '../enums';
import { TContrastBoundary, TContrastCheckerState, TContrastUnsupportedReason } from '../types';
import { THsv } from '../../../../types';

export type TUseContrastCheckerResult = {
  backgroundColor: string | null;
  boundaries: TContrastBoundary[];
  canShowAAA: boolean;
  category: ContrastCategory;
  correctionPreview: THsv | null;
  isActive: boolean;
  level: ContrastLevel;
  onAutoCorrect: TFunc;
  onAutoCorrectHoverChange: TFunc<[boolean]>;
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
  const [isHoveringAutoCorrect, setIsHoveringAutoCorrect] = useState(false);
  const isSupported = unsupportedReason === undefined;
  const backgroundLuminance = backgroundColor && isSupported ? getRelativeLuminance(hexToRgb(backgroundColor)) : null;
  const threshold = getContrastThreshold(state.category, state.level);
  const ratio = backgroundColor && isSupported ? truncateContrastRatio(getContrastRatio(hsvToRgb(hsv), hexToRgb(backgroundColor))) : null;
  const boundaries = backgroundLuminance !== null ? getContrastBoundaries(hsv.h, backgroundLuminance, threshold) : [];
  const passes = ratio !== null && ratio >= threshold;
  const correctionTarget = getCorrectionTarget({ backgroundColor, boundaries, hsv, isCorrectable: isSupported && !passes, threshold });

  return {
    backgroundColor: backgroundColor ?? null,
    boundaries,
    canShowAAA: state.category === ContrastCategory.normalText || state.category === ContrastCategory.largeText,
    category: state.category,
    correctionPreview: isHoveringAutoCorrect ? correctionTarget : null,
    isActive: state.isActive,
    level: state.level,
    onAutoCorrect: (): void => applyContrastCorrection(correctionTarget, onCorrect, () => setIsHoveringAutoCorrect(false)),
    onAutoCorrectHoverChange: setIsHoveringAutoCorrect,
    onSetCategory: (category: ContrastCategory): void => updateContrastCheckerState({ category }, setState),
    onSetLevel: (level: ContrastLevel): void => updateContrastCheckerState({ level }, setState),
    onToggleActive: (): void => updateContrastCheckerState({ isActive: !contrastCheckerStateCache.current.isActive }, setState),
    passes,
    ratio,
    unsupportedReason: unsupportedReason ?? null,
  };
};
