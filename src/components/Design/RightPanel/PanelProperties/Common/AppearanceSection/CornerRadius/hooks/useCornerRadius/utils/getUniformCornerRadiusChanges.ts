// types
import { TCornerRadiusChanges } from './commitCornerRadiusChange';

export const getUniformCornerRadiusChanges = (value: number): TCornerRadiusChanges => ({
  cornerRadius: value,
  cornerRadiusBottomLeft: value,
  cornerRadiusBottomRight: value,
  cornerRadiusTopLeft: value,
  cornerRadiusTopRight: value,
});
