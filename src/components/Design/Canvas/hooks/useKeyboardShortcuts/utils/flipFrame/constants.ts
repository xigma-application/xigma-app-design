// types
import { AlignmentHorizontal, AlignmentLayout, AlignmentVertical, LayoutGuideColumnsAlign, LayoutGuideRowsAlign } from 'types/design/enums';
import { TFlipAxis } from './types';

export const MIRRORED_LAYOUT_ALIGNMENT: Record<TFlipAxis, Record<AlignmentLayout, AlignmentLayout>> = {
  horizontal: {
    [AlignmentLayout.bottomCenter]: AlignmentLayout.bottomCenter,
    [AlignmentLayout.bottomLeft]: AlignmentLayout.bottomRight,
    [AlignmentLayout.bottomRight]: AlignmentLayout.bottomLeft,
    [AlignmentLayout.center]: AlignmentLayout.center,
    [AlignmentLayout.left]: AlignmentLayout.right,
    [AlignmentLayout.right]: AlignmentLayout.left,
    [AlignmentLayout.topCenter]: AlignmentLayout.topCenter,
    [AlignmentLayout.topLeft]: AlignmentLayout.topRight,
    [AlignmentLayout.topRight]: AlignmentLayout.topLeft,
  },
  vertical: {
    [AlignmentLayout.bottomCenter]: AlignmentLayout.topCenter,
    [AlignmentLayout.bottomLeft]: AlignmentLayout.topLeft,
    [AlignmentLayout.bottomRight]: AlignmentLayout.topRight,
    [AlignmentLayout.center]: AlignmentLayout.center,
    [AlignmentLayout.left]: AlignmentLayout.left,
    [AlignmentLayout.right]: AlignmentLayout.right,
    [AlignmentLayout.topCenter]: AlignmentLayout.bottomCenter,
    [AlignmentLayout.topLeft]: AlignmentLayout.bottomLeft,
    [AlignmentLayout.topRight]: AlignmentLayout.bottomRight,
  },
};

export const MIRRORED_HORIZONTAL_ALIGN: Record<AlignmentHorizontal, AlignmentHorizontal> = {
  [AlignmentHorizontal.center]: AlignmentHorizontal.center,
  [AlignmentHorizontal.left]: AlignmentHorizontal.right,
  [AlignmentHorizontal.right]: AlignmentHorizontal.left,
};

export const MIRRORED_VERTICAL_ALIGN: Record<AlignmentVertical, AlignmentVertical> = {
  [AlignmentVertical.bottom]: AlignmentVertical.top,
  [AlignmentVertical.center]: AlignmentVertical.center,
  [AlignmentVertical.top]: AlignmentVertical.bottom,
};

export const MIRRORED_COLUMNS_ALIGN: Record<LayoutGuideColumnsAlign, LayoutGuideColumnsAlign> = {
  [LayoutGuideColumnsAlign.center]: LayoutGuideColumnsAlign.center,
  [LayoutGuideColumnsAlign.left]: LayoutGuideColumnsAlign.right,
  [LayoutGuideColumnsAlign.right]: LayoutGuideColumnsAlign.left,
  [LayoutGuideColumnsAlign.stretch]: LayoutGuideColumnsAlign.stretch,
};

export const MIRRORED_ROWS_ALIGN: Record<LayoutGuideRowsAlign, LayoutGuideRowsAlign> = {
  [LayoutGuideRowsAlign.bottom]: LayoutGuideRowsAlign.top,
  [LayoutGuideRowsAlign.center]: LayoutGuideRowsAlign.center,
  [LayoutGuideRowsAlign.stretch]: LayoutGuideRowsAlign.stretch,
  [LayoutGuideRowsAlign.top]: LayoutGuideRowsAlign.bottom,
};
