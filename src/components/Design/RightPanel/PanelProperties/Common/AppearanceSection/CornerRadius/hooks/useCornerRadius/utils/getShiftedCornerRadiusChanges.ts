// types
import { TAppearanceNode } from '../../../../types';
import { TCornerRadiusChanges } from './commitCornerRadiusChange';

// utils
import { clamp } from './clamp';
import { getNodeCornerRadii } from './getNodeCornerRadii';

export const getShiftedCornerRadiusChanges = (node: TAppearanceNode, delta: number): TCornerRadiusChanges => {
  const radii = getNodeCornerRadii(node);

  return {
    cornerRadius: clamp((node.cornerRadius ?? 0) + delta),
    cornerRadiusBottomLeft: clamp(radii.cornerRadiusBottomLeft + delta),
    cornerRadiusBottomRight: clamp(radii.cornerRadiusBottomRight + delta),
    cornerRadiusTopLeft: clamp(radii.cornerRadiusTopLeft + delta),
    cornerRadiusTopRight: clamp(radii.cornerRadiusTopRight + delta),
  };
};
