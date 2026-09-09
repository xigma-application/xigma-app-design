// types
import { TAutoLayoutChildSize } from './getAutoLayoutChildPositions/getAutoLayoutChildPositions';

// utils
import { getTextBaselineOffset } from './getTextBaselineOffset';

export const getAutoLayoutChildBaselineOffset = (child: TAutoLayoutChildSize): number =>
  child.fontSize === undefined ? child.height : getTextBaselineOffset(child.fontSize);
