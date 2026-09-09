// types
import { AutoSpacing } from 'types/design/enums';
import { TAxisAlign } from '../getAlignmentComponents';

// utils
import { getAutoLayoutPrimarySpacing } from '../getAutoLayoutPrimarySpacing';
import { getAxisOffset } from '../getAxisOffset';

export type TAutoLayoutPrimaryLayout = { effectiveGap: number; offset: number };

export const getAutoLayoutPrimaryLayout = (
  primarySize: number,
  childrenPrimarySize: number,
  childrenCount: number,
  isPrimaryGapAuto: boolean,
  itemSpacing: number,
  autoSpacing: AutoSpacing,
  primaryAlign: TAxisAlign,
): TAutoLayoutPrimaryLayout => {
  const primarySpacing = isPrimaryGapAuto
    ? getAutoLayoutPrimarySpacing(primarySize, childrenPrimarySize, childrenCount, autoSpacing)
    : { edgeOffset: 0, gap: itemSpacing };
  const effectiveGap = primarySpacing.gap;
  const contentLength = childrenPrimarySize + effectiveGap * Math.max(0, childrenCount - 1);
  const offset = isPrimaryGapAuto ? primarySpacing.edgeOffset : getAxisOffset(primaryAlign, primarySize, contentLength);

  return { effectiveGap, offset };
};
