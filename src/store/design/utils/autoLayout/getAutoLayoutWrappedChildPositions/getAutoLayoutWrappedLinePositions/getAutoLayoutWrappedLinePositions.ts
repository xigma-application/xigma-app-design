// types
import { AutoSpacing, LayoutVersion } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TAxisAlign } from '../../getAlignmentComponents';
import { TDraftRect } from 'types/canvas';

// utils
import { getAutoLayoutBaselineExtent } from '../../getAutoLayoutBaselineExtent';
import { getAutoLayoutLineLength } from '../../getAutoLayoutLineLength';
import { getAxisOffset } from '../../getAxisOffset';
import { getLinePrimarySpacing } from './getLinePrimarySpacing';
import { getWithinLineOffset } from './getWithinLineOffset';
import { getWrappedLineChildPosition } from './getWrappedLineChildPosition';

export const getAutoLayoutWrappedLinePositions = (
  line: TAutoLayoutChildSize[],
  isHorizontal: boolean,
  frame: TDraftRect,
  primaryAlign: TAxisAlign,
  counterAlign: TAxisAlign,
  availablePrimary: number,
  isPrimaryGapAuto: boolean,
  itemSpacing: number,
  autoSpacing: AutoSpacing,
  alignTextBaseline: boolean,
  lineThickness: number,
  counterOffset: number,
  layoutVersion: LayoutVersion = LayoutVersion.updated,
): TAutoLayoutChildPosition[] => {
  const linePrimarySize = line.reduce((total, child) => total + (isHorizontal ? child.width : child.height), 0);
  const lineChildrenCount = line.length;
  const args = { autoSpacing, availablePrimary, isPrimaryGapAuto, itemSpacing, layoutVersion, lineChildrenCount, linePrimarySize };
  const primarySpacing = getLinePrimarySpacing(args);
  const effectiveItemSpacing = primarySpacing.gap;
  const lineLength = getAutoLayoutLineLength(isHorizontal, effectiveItemSpacing, line);
  let primaryOffset = isPrimaryGapAuto ? primarySpacing.edgeOffset : getAxisOffset(primaryAlign, availablePrimary, lineLength);
  const { maxBaseline } = getAutoLayoutBaselineExtent(line);

  return line.map((child) => {
    const size = isHorizontal ? child.width : child.height;
    const counterChildSize = isHorizontal ? child.height : child.width;
    const withinLineOffset = getWithinLineOffset(alignTextBaseline, maxBaseline, child, counterAlign, lineThickness, counterChildSize);
    const position = getWrappedLineChildPosition(child, isHorizontal, frame, primaryOffset, counterOffset, withinLineOffset);

    primaryOffset += size + effectiveItemSpacing;

    return position;
  });
};
