// types
import { SizingMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';

// utils
import { getAutoLayoutFillSizes } from './getAutoLayoutFillSizes';
import { getAutoLayoutLineThickness } from '../getAutoLayoutLineThickness';
import { getFillableAutoLayoutSizes } from './getFillableAutoLayoutSizes';

export const getAutoLayoutFilledLines = (
  isHorizontal: boolean,
  itemSpacing: number,
  availableContentPrimary: number,
  widthMode: SizingMode,
  heightMode: SizingMode,
  lines: TAutoLayoutChildSize[][],
  alignTextBaseline = false,
): TAutoLayoutChildSize[][] =>
  lines.map((line) => {
    const fillableLine = getFillableAutoLayoutSizes(line, widthMode, heightMode);
    const lineThickness = getAutoLayoutLineThickness(isHorizontal, line, alignTextBaseline);

    return getAutoLayoutFillSizes(isHorizontal, itemSpacing, availableContentPrimary, lineThickness, fillableLine);
  });
