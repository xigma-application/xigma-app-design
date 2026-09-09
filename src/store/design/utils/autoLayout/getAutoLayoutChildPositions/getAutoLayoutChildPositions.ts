// types
import { AlignmentLayout, AutoSpacing, LayoutMode, LayoutVersion, SizingMode, StrokeAlign } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';

// utils
import { getAlignmentComponents } from '../getAlignmentComponents';
import { getAutoLayoutBaselineExtent } from '../getAutoLayoutBaselineExtent';
import { getAutoLayoutChildPosition } from './getAutoLayoutChildPosition';
import { getAutoLayoutPrimaryLayout } from './getAutoLayoutPrimaryLayout';

export type TAutoLayoutChildSize = {
  fontSize?: number;
  height: number;
  heightSizingMode?: SizingMode;
  id: string;
  maxHeight?: number;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
  strokeAlign?: StrokeAlign;
  strokeWidth?: number;
  width: number;
  widthSizingMode?: SizingMode;
};

export type TAutoLayoutChildPosition = { height: number; id: string; width: number; x: number; y: number };

export const getAutoLayoutChildPositions = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  alignment: AlignmentLayout,
  frame: TDraftRect,
  children: TAutoLayoutChildSize[],
  isPrimaryGapAuto = false,
  alignTextBaseline = false,
  autoSpacing = AutoSpacing.between,
  layoutVersion = LayoutVersion.updated,
): TAutoLayoutChildPosition[] => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const { x: xAlign, y: yAlign } = getAlignmentComponents(alignment);
  const primaryAlign = isHorizontal ? xAlign : yAlign;
  const counterAlign = isHorizontal ? yAlign : xAlign;
  const primarySize = isHorizontal ? frame.width : frame.height;
  const counterSize = isHorizontal ? frame.height : frame.width;
  const childrenPrimarySize = children.reduce((total, child) => total + (isHorizontal ? child.width : child.height), 0);
  const { effectiveGap, offset: startOffset } = getAutoLayoutPrimaryLayout(
    primarySize,
    childrenPrimarySize,
    children.length,
    isPrimaryGapAuto,
    itemSpacing,
    autoSpacing,
    primaryAlign,
    layoutVersion,
  );
  const { maxBaseline } = getAutoLayoutBaselineExtent(children);
  let offset = startOffset;

  return children.map((child) => {
    const position = getAutoLayoutChildPosition(
      child,
      isHorizontal,
      frame,
      offset,
      counterAlign,
      counterSize,
      alignTextBaseline,
      maxBaseline,
    );
    const size = isHorizontal ? child.width : child.height;

    offset += size + effectiveGap;

    return position;
  });
};
