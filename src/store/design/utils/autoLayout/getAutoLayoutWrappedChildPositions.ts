// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from './getAutoLayoutChildPositions';
import { TDraftRect } from 'types/canvas';

// utils
import { getAlignmentComponents } from './getAlignmentComponents';
import { getAutoLayoutBlockCounterLength } from './getAutoLayoutBlockCounterLength';
import { getAutoLayoutLineLength } from './getAutoLayoutLineLength';
import { getAutoLayoutLineThickness } from './getAutoLayoutLineThickness';
import { getAxisOffset } from './getAxisOffset';

export const getAutoLayoutWrappedChildPositions = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  counterAxisSpacing: number,
  alignment: AlignmentLayout,
  frame: TDraftRect,
  lines: TAutoLayoutChildSize[][],
): TAutoLayoutChildPosition[] => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const availablePrimary = isHorizontal ? frame.width : frame.height;
  const availableCounter = isHorizontal ? frame.height : frame.width;
  const { x: xAlign, y: yAlign } = getAlignmentComponents(alignment);
  const primaryAlign = isHorizontal ? xAlign : yAlign;
  const counterAlign = isHorizontal ? yAlign : xAlign;
  const lineThicknesses = lines.map((line) => getAutoLayoutLineThickness(isHorizontal, line));
  const blockCounterLength = getAutoLayoutBlockCounterLength(counterAxisSpacing, lineThicknesses);
  let counterOffset = getAxisOffset(counterAlign, availableCounter, blockCounterLength);
  const positions: TAutoLayoutChildPosition[] = [];

  lines.forEach((line, lineIndex) => {
    const lineLength = getAutoLayoutLineLength(isHorizontal, itemSpacing, line);
    let primaryOffset = getAxisOffset(primaryAlign, availablePrimary, lineLength);

    line.forEach((child) => {
      const size = isHorizontal ? child.width : child.height;
      const counterChildSize = isHorizontal ? child.height : child.width;
      const withinLineOffset = getAxisOffset(counterAlign, lineThicknesses[lineIndex], counterChildSize);
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
      primaryOffset += size + itemSpacing;
    });

    counterOffset += lineThicknesses[lineIndex] + counterAxisSpacing;
  });

  return positions;
};
