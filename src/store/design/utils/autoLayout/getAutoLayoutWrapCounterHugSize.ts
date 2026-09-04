// types
import { LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from './getAutoLayoutChildPositions';
import { TAutoLayoutPadding } from './getAutoLayoutContentBox';

// utils
import { getAutoLayoutBlockCounterLength } from './getAutoLayoutBlockCounterLength';
import { getAutoLayoutLineThickness } from './getAutoLayoutLineThickness';

export const getAutoLayoutWrapCounterHugSize = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  counterAxisSpacing: number,
  padding: TAutoLayoutPadding,
  lines: TAutoLayoutChildSize[][],
): number => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const lineThicknesses = lines.map((line) => getAutoLayoutLineThickness(isHorizontal, line));
  const blockCounterLength = getAutoLayoutBlockCounterLength(counterAxisSpacing, lineThicknesses);

  return blockCounterLength + (isHorizontal ? padding.paddingTop + padding.paddingBottom : padding.paddingLeft + padding.paddingRight);
};
