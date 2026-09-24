// types
import { TAppearanceNode } from '../../../../types';
import { TCornerRadiusKey } from '../types';

export const getNodeCornerRadii = (node: TAppearanceNode | undefined): Record<TCornerRadiusKey, number> => {
  const base = node?.cornerRadius ?? 0;

  return {
    cornerRadiusBottomLeft: node?.cornerRadiusBottomLeft ?? base,
    cornerRadiusBottomRight: node?.cornerRadiusBottomRight ?? base,
    cornerRadiusTopLeft: node?.cornerRadiusTopLeft ?? base,
    cornerRadiusTopRight: node?.cornerRadiusTopRight ?? base,
  };
};
