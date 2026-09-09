// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from './getAutoLayoutChildPositions';
import { TDraftRect } from 'types/canvas';

// utils
import { getAlignmentComponents } from './getAlignmentComponents';
import { getAutoLayoutBaselineExtent } from './getAutoLayoutBaselineExtent';
import { getAutoLayoutBlockCounterLength } from './getAutoLayoutBlockCounterLength';
import { getAutoLayoutChildBaselineOffset } from './getAutoLayoutChildBaselineOffset';
import { getAutoLayoutLineLength } from './getAutoLayoutLineLength';
import { getAutoLayoutLineThickness } from './getAutoLayoutLineThickness';
import { getAxisOffset } from './getAxisOffset';
import { getDistributedGap } from './getDistributedGap';

export const getAutoLayoutWrappedChildPositions = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  counterAxisSpacing: number,
  alignment: AlignmentLayout,
  frame: TDraftRect,
  lines: TAutoLayoutChildSize[][],
  isPrimaryGapAuto = false,
  isCounterGapAuto = false,
  alignTextBaseline = false,
): TAutoLayoutChildPosition[] => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const availablePrimary = isHorizontal ? frame.width : frame.height;
  const availableCounter = isHorizontal ? frame.height : frame.width;
  const { x: xAlign, y: yAlign } = getAlignmentComponents(alignment);
  const primaryAlign = isHorizontal ? xAlign : yAlign;
  const counterAlign = isHorizontal ? yAlign : xAlign;
  const lineThicknesses = lines.map((line) => getAutoLayoutLineThickness(isHorizontal, line, alignTextBaseline));
  const totalLineThickness = lineThicknesses.reduce((total, thickness) => total + thickness, 0);
  const effectiveCounterGap = isCounterGapAuto ? getDistributedGap(availableCounter, totalLineThickness, lines.length) : counterAxisSpacing;
  const blockCounterLength = getAutoLayoutBlockCounterLength(effectiveCounterGap, lineThicknesses);
  let counterOffset = isCounterGapAuto ? 0 : getAxisOffset(counterAlign, availableCounter, blockCounterLength);
  const positions: TAutoLayoutChildPosition[] = [];

  lines.forEach((line, lineIndex) => {
    const linePrimarySize = line.reduce((total, child) => total + (isHorizontal ? child.width : child.height), 0);
    const effectiveItemSpacing = isPrimaryGapAuto ? getDistributedGap(availablePrimary, linePrimarySize, line.length) : itemSpacing;
    const lineLength = getAutoLayoutLineLength(isHorizontal, effectiveItemSpacing, line);
    let primaryOffset = isPrimaryGapAuto ? 0 : getAxisOffset(primaryAlign, availablePrimary, lineLength);
    const { maxBaseline } = getAutoLayoutBaselineExtent(line);

    line.forEach((child) => {
      const size = isHorizontal ? child.width : child.height;
      const counterChildSize = isHorizontal ? child.height : child.width;
      const withinLineOffset = alignTextBaseline
        ? maxBaseline - getAutoLayoutChildBaselineOffset(child)
        : getAxisOffset(counterAlign, lineThicknesses[lineIndex], counterChildSize);
      const position = isHorizontal
        ? {
            height: child.height,
            id: child.id,
            width: child.width,
            x: frame.x + primaryOffset,
            y: frame.y + counterOffset + withinLineOffset,
          }
        : {
            height: child.height,
            id: child.id,
            width: child.width,
            x: frame.x + counterOffset + withinLineOffset,
            y: frame.y + primaryOffset,
          };

      positions.push(position);
      primaryOffset += size + effectiveItemSpacing;
    });

    counterOffset += lineThicknesses[lineIndex] + effectiveCounterGap;
  });

  return positions;
};
