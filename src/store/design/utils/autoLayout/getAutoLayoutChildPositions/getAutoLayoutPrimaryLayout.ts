// types
import { AutoSpacing, LayoutVersion } from 'types/design/enums';
import { TAxisAlign } from '../getAlignmentComponents';

// utils
import { getAutoLayoutPrimarySpacing, TAutoLayoutPrimarySpacing } from '../getAutoLayoutPrimarySpacing';
import { getAxisOffset } from '../getAxisOffset';

export type TAutoLayoutPrimaryLayout = { effectiveGap: number; offset: number };

const isLegacyLoneBetween = (
  layoutVersion: LayoutVersion,
  isPrimaryGapAuto: boolean,
  autoSpacing: AutoSpacing,
  childrenCount: number,
): boolean => layoutVersion === LayoutVersion.legacy && isPrimaryGapAuto && autoSpacing === AutoSpacing.between && childrenCount === 1;

const getPrimarySpacing = (
  isPrimaryGapAuto: boolean,
  primarySize: number,
  childrenPrimarySize: number,
  childrenCount: number,
  autoSpacing: AutoSpacing,
  itemSpacing: number,
  layoutVersion: LayoutVersion,
): TAutoLayoutPrimarySpacing =>
  isPrimaryGapAuto
    ? getAutoLayoutPrimarySpacing(primarySize, childrenPrimarySize, childrenCount, autoSpacing, layoutVersion)
    : { edgeOffset: 0, gap: itemSpacing };

const getAutoLayoutPrimaryOffset = (
  isPrimaryGapAuto: boolean,
  isLoneBetween: boolean,
  primarySpacing: TAutoLayoutPrimarySpacing,
  primaryAlign: TAxisAlign,
  primarySize: number,
  contentLength: number,
): number => {
  switch (true) {
    case isLoneBetween:
      return getAxisOffset('center', primarySize, contentLength);
    case isPrimaryGapAuto:
      return primarySpacing.edgeOffset;
    default:
      return getAxisOffset(primaryAlign, primarySize, contentLength);
  }
};

export const getAutoLayoutPrimaryLayout = (
  primarySize: number,
  childrenPrimarySize: number,
  childrenCount: number,
  isPrimaryGapAuto: boolean,
  itemSpacing: number,
  autoSpacing: AutoSpacing,
  primaryAlign: TAxisAlign,
  layoutVersion: LayoutVersion = LayoutVersion.updated,
): TAutoLayoutPrimaryLayout => {
  const primarySpacing = getPrimarySpacing(
    isPrimaryGapAuto,
    primarySize,
    childrenPrimarySize,
    childrenCount,
    autoSpacing,
    itemSpacing,
    layoutVersion,
  );
  const effectiveGap = primarySpacing.gap;
  const contentLength = childrenPrimarySize + effectiveGap * Math.max(0, childrenCount - 1);
  const loneBetween = isLegacyLoneBetween(layoutVersion, isPrimaryGapAuto, autoSpacing, childrenCount);
  const offset = getAutoLayoutPrimaryOffset(isPrimaryGapAuto, loneBetween, primarySpacing, primaryAlign, primarySize, contentLength);

  return { effectiveGap, offset };
};
