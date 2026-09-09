// types
import { AutoSpacing, LayoutVersion } from 'types/design/enums';

// utils
import { getAutoLayoutPrimarySpacing, TAutoLayoutPrimarySpacing } from '../../getAutoLayoutPrimarySpacing';

export type TGetLinePrimarySpacingParams = {
  autoSpacing: AutoSpacing;
  availablePrimary: number;
  isPrimaryGapAuto: boolean;
  itemSpacing: number;
  layoutVersion: LayoutVersion;
  lineChildrenCount: number;
  linePrimarySize: number;
};

export const getLinePrimarySpacing = ({
  autoSpacing,
  availablePrimary,
  isPrimaryGapAuto,
  itemSpacing,
  layoutVersion,
  lineChildrenCount,
  linePrimarySize,
}: TGetLinePrimarySpacingParams): TAutoLayoutPrimarySpacing =>
  isPrimaryGapAuto
    ? getAutoLayoutPrimarySpacing(availablePrimary, linePrimarySize, lineChildrenCount, autoSpacing, layoutVersion)
    : { edgeOffset: 0, gap: itemSpacing };
