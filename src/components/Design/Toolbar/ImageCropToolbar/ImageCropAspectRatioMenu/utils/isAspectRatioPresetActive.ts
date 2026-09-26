// types
import { TAspectRatioTarget } from '../types';
import { TImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImagePaint, TVideoPaint } from 'types/design/paint/types';

// utils
import { getAspectRatioPresetRect } from './getAspectRatioPresetRect';
import { getMaxCornerRadius } from 'utils/canvas/cornerRadius/getMaxCornerRadius';

type TRectLike = { height: number; width: number; x: number; y: number };

const CLOSE_ENOUGH_EPSILON = 0.5;

const isClose = (a: number, b: number): boolean => Math.abs(a - b) < CLOSE_ENOUGH_EPSILON;

const doesNodeMatchRect = (node: TRectLike, rect: TRectLike): boolean =>
  isClose(node.x, rect.x) && isClose(node.y, rect.y) && isClose(node.width, rect.width) && isClose(node.height, rect.height);

export const isAspectRatioPresetActive = (node: TImageFrameNode, paint: TImagePaint | TVideoPaint, target: TAspectRatioTarget): boolean => {
  const rect = getAspectRatioPresetRect(node, paint, target);

  if (rect) {
    const matchesRect = doesNodeMatchRect(node, rect);
    const wantsMaxCornerRadius = typeof target === 'object' && target.cornerRadius === 'max';

    if (wantsMaxCornerRadius) {
      return matchesRect && isClose(node.cornerRadius ?? 0, getMaxCornerRadius(rect));
    }

    return matchesRect;
  }

  return false;
};
