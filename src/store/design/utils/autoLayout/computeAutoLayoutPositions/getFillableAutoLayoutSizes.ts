// types
import { SizingMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';

export const getFillableAutoLayoutSizes = (
  sizes: TAutoLayoutChildSize[],
  widthMode: SizingMode,
  heightMode: SizingMode,
): TAutoLayoutChildSize[] =>
  sizes.map((size) => ({
    ...size,
    heightSizingMode: heightMode === SizingMode.hug ? undefined : size.heightSizingMode,
    widthSizingMode: widthMode === SizingMode.hug ? undefined : size.widthSizingMode,
  }));
