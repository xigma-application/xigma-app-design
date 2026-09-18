// others
import { getContrastRatio } from 'utils/color/getContrastRatio';
import { getNearestBoundaryPoint } from './getNearestBoundaryPoint';
import { hexToRgb } from 'utils/color/hexToRgb';
import { hsvToRgb } from '../../../../utils/hsvToRgb';
import { truncateContrastRatio } from 'utils/color/truncateContrastRatio';

// types
import { TContrastBoundary } from '../types';
import { THsv } from '../../../../types';

const NUDGE_STEP = 0.05;
const MAX_NUDGES = 60;

export type TCorrectionTargetInput = {
  backgroundColor: string | null | undefined;
  boundaries: TContrastBoundary[];
  hsv: THsv;
  isCorrectable: boolean;
  threshold: number;
};

export const getCorrectionTarget = ({
  backgroundColor,
  boundaries,
  hsv,
  isCorrectable,
  threshold,
}: TCorrectionTargetInput): THsv | null => {
  const nearest = backgroundColor && isCorrectable ? getNearestBoundaryPoint(boundaries, { s: hsv.s, v: hsv.v }) : null;

  if (backgroundColor && nearest) {
    const direction = nearest.passSide === 'lighter' ? 1 : -1;
    const background = hexToRgb(backgroundColor);
    let target: THsv = { h: hsv.h, s: nearest.point.s, v: nearest.point.v };

    for (let nudge = 0; nudge < MAX_NUDGES; nudge += 1) {
      if (truncateContrastRatio(getContrastRatio(hsvToRgb(target), background)) >= threshold) {
        return target;
      }

      target = { ...target, v: Math.min(100, Math.max(0, target.v + direction * NUDGE_STEP)) };
    }

    return target;
  }

  return null;
};
