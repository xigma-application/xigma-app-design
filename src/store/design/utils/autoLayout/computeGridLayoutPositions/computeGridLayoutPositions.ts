// types
import { LayoutVersion, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TFrameNode, TGridTrackSize } from 'types/design/types';

// utils
import { clampAutoLayoutFrameToPadding } from '../computeAutoLayoutPositions/clampAutoLayoutFrameToPadding';
import { resolveGridLayout } from './resolveGridLayout/resolveGridLayout';
import { TAutoLayoutPadding } from '../getAutoLayoutContentBox';

export type TComputeGridLayoutPositionsInput = {
  autoPlacement: boolean;
  columnCount: number;
  columnGap: number;
  columnSizes?: TGridTrackSize[];
  frame: TFrameNode;
  layoutVersion: LayoutVersion;
  padding: TAutoLayoutPadding;
  rowCount?: number;
  rowGap: number;
  rowSizes?: TGridTrackSize[];
  sizes: TAutoLayoutChildSize[];
};

export const computeGridLayoutPositions = (input: TComputeGridLayoutPositionsInput): TAutoLayoutChildPosition[] => {
  const { autoPlacement, columnCount, columnGap, columnSizes, frame, layoutVersion, padding, rowCount, rowGap, rowSizes, sizes } = input;
  const widthMode = frame.widthSizingMode ?? SizingMode.fixed;
  const heightMode = frame.heightSizingMode ?? SizingMode.fixed;
  const isWidthHug = widthMode === SizingMode.hug;
  const isHeightHug = heightMode === SizingMode.hug;

  clampAutoLayoutFrameToPadding(frame, widthMode, heightMode, padding, layoutVersion);

  return resolveGridLayout({
    autoPlacement,
    columnCount,
    columnGap,
    columnSizes,
    frame,
    isHeightHug,
    isWidthHug,
    padding,
    rowCount,
    rowGap,
    rowSizes,
    sizes,
  });
};
