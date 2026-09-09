// types
import { TAutoLayoutPadding } from '../../getAutoLayoutContentBox';
import { TFrameNode } from 'types/design/types';

// utils
import { clampAutoLayoutSize } from '../../clampAutoLayoutSize';

export type TApplyGridHugSizingInput = {
  columnCount: number;
  columnGap: number;
  columnTrackSizes: number[];
  frame: TFrameNode;
  isHeightHug: boolean;
  isWidthHug: boolean;
  padding: TAutoLayoutPadding;
  rowCount: number;
  rowGap: number;
  rowTrackSizes: number[];
};

const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0);

export const applyGridHugSizing = (input: TApplyGridHugSizingInput): void => {
  const { columnCount, columnGap, columnTrackSizes, frame, isHeightHug, isWidthHug, padding, rowCount, rowGap, rowTrackSizes } = input;

  if (isWidthHug) {
    const hugWidth = padding.paddingLeft + padding.paddingRight + sum(columnTrackSizes) + columnGap * Math.max(columnCount - 1, 0);
    frame.width = clampAutoLayoutSize(hugWidth, frame.minWidth, frame.maxWidth);
  }

  if (isHeightHug) {
    const hugHeight = padding.paddingTop + padding.paddingBottom + sum(rowTrackSizes) + rowGap * Math.max(rowCount - 1, 0);
    frame.height = clampAutoLayoutSize(hugHeight, frame.minHeight, frame.maxHeight);
  }
};
