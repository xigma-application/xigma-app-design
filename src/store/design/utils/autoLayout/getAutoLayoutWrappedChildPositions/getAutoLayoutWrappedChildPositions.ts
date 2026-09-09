// types
import { AlignmentLayout, AutoSpacing, LayoutMode, LayoutVersion } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TDraftRect } from 'types/canvas';

// utils
import { getAlignmentComponents } from '../getAlignmentComponents';
import { getAutoLayoutWrappedCounterLayout } from './getAutoLayoutWrappedCounterLayout';
import { getAutoLayoutWrappedLinePositions } from './getAutoLayoutWrappedLinePositions/getAutoLayoutWrappedLinePositions';

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
  autoSpacing = AutoSpacing.between,
  layoutVersion = LayoutVersion.updated,
): TAutoLayoutChildPosition[] => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const availablePrimary = isHorizontal ? frame.width : frame.height;
  const availableCounter = isHorizontal ? frame.height : frame.width;
  const { x: xAlign, y: yAlign } = getAlignmentComponents(alignment);
  const primaryAlign = isHorizontal ? xAlign : yAlign;
  const counterAlign = isHorizontal ? yAlign : xAlign;
  const positions: TAutoLayoutChildPosition[] = [];
  const {
    counterOffset: startCounterOffset,
    effectiveCounterGap,
    lineThicknesses,
  } = getAutoLayoutWrappedCounterLayout(
    isHorizontal,
    lines,
    alignTextBaseline,
    isCounterGapAuto,
    counterAxisSpacing,
    availableCounter,
    counterAlign,
  );
  let counterOffset = startCounterOffset;

  lines.forEach((line, lineIndex) => {
    const linePositions = getAutoLayoutWrappedLinePositions(
      line,
      isHorizontal,
      frame,
      primaryAlign,
      counterAlign,
      availablePrimary,
      isPrimaryGapAuto,
      itemSpacing,
      autoSpacing,
      alignTextBaseline,
      lineThicknesses[lineIndex],
      counterOffset,
      layoutVersion,
    );

    positions.push(...linePositions);
    counterOffset += lineThicknesses[lineIndex] + effectiveCounterGap;
  });

  return positions;
};
