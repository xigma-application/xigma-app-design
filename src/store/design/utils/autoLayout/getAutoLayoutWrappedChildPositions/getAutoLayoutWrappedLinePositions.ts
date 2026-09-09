// types
import { AutoSpacing } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TAxisAlign } from '../getAlignmentComponents';
import { TDraftRect } from 'types/canvas';

// utils
import { getAutoLayoutBaselineExtent } from '../getAutoLayoutBaselineExtent';
import { getAutoLayoutChildBaselineOffset } from '../getAutoLayoutChildBaselineOffset';
import { getAutoLayoutLineLength } from '../getAutoLayoutLineLength';
import { getAutoLayoutPrimarySpacing, TAutoLayoutPrimarySpacing } from '../getAutoLayoutPrimarySpacing';
import { getAxisOffset } from '../getAxisOffset';

const getLinePrimarySpacing = (
  isPrimaryGapAuto: boolean,
  availablePrimary: number,
  linePrimarySize: number,
  lineChildrenCount: number,
  autoSpacing: AutoSpacing,
  itemSpacing: number,
): TAutoLayoutPrimarySpacing =>
  isPrimaryGapAuto
    ? getAutoLayoutPrimarySpacing(availablePrimary, linePrimarySize, lineChildrenCount, autoSpacing)
    : { edgeOffset: 0, gap: itemSpacing };

const getWithinLineOffset = (
  alignTextBaseline: boolean,
  maxBaseline: number,
  child: TAutoLayoutChildSize,
  counterAlign: TAxisAlign,
  lineThickness: number,
  counterChildSize: number,
): number =>
  alignTextBaseline ? maxBaseline - getAutoLayoutChildBaselineOffset(child) : getAxisOffset(counterAlign, lineThickness, counterChildSize);

const getWrappedLineChildPosition = (
  child: TAutoLayoutChildSize,
  isHorizontal: boolean,
  frame: TDraftRect,
  primaryOffset: number,
  counterOffset: number,
  withinLineOffset: number,
): TAutoLayoutChildPosition =>
  isHorizontal
    ? { height: child.height, id: child.id, width: child.width, x: frame.x + primaryOffset, y: frame.y + counterOffset + withinLineOffset }
    : { height: child.height, id: child.id, width: child.width, x: frame.x + counterOffset + withinLineOffset, y: frame.y + primaryOffset };

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
): TAutoLayoutChildPosition[] => {
  const linePrimarySize = line.reduce((total, child) => total + (isHorizontal ? child.width : child.height), 0);
  const primarySpacing = getLinePrimarySpacing(isPrimaryGapAuto, availablePrimary, linePrimarySize, line.length, autoSpacing, itemSpacing);
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
