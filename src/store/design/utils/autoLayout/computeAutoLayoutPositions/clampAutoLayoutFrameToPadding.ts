// types
import { LayoutVersion, SizingMode } from 'types/design/enums';
import { TAutoLayoutPadding } from '../getAutoLayoutContentBox';
import { TFrameNode } from 'types/design/types';

export const clampAutoLayoutFrameToPadding = (
  frame: TFrameNode,
  widthMode: SizingMode,
  heightMode: SizingMode,
  padding: TAutoLayoutPadding,
  layoutVersion: LayoutVersion,
): void => {
  if (layoutVersion === LayoutVersion.updated) {
    if (widthMode !== SizingMode.hug) {
      frame.width = Math.max(frame.width, padding.paddingLeft + padding.paddingRight);
    }

    if (heightMode !== SizingMode.hug) {
      frame.height = Math.max(frame.height, padding.paddingTop + padding.paddingBottom);
    }
  }
};
