// types
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TAspectRatioTarget } from '../types';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { getAspectRatioPresetRect } from './getAspectRatioPresetRect';
import { getMaxCornerRadius } from 'utils/canvas/cornerRadius/getMaxCornerRadius';

const CLOSE_ENOUGH_EPSILON = 0.5;

const isClose = (a: number, b: number): boolean => Math.abs(a - b) < CLOSE_ENOUGH_EPSILON;

export const isAspectRatioPresetActive = (node: TAppearanceNode, paint: TImagePaint, target: TAspectRatioTarget): boolean => {
  const rect = getAspectRatioPresetRect(node, paint, target);

  if (rect) {
    const matchesRect = isClose(node.x, rect.x) && isClose(node.y, rect.y) && isClose(node.width, rect.width) && isClose(node.height, rect.height);
    const wantsMaxCornerRadius = typeof target === 'object' && target.cornerRadius === 'max';

    if (wantsMaxCornerRadius) {
      return matchesRect && isClose(node.cornerRadius ?? 0, getMaxCornerRadius(rect));
    }

    return matchesRect;
  }

  return false;
};
