// types
import { InsideStroke } from 'types/design/enums';
import { TAutoLayoutPadding } from './getAutoLayoutContentBox';
import { TFrameNode } from 'types/design/types';

// utils
import { getFramePadding } from './getFramePadding';

export const getFrameLayoutPadding = (frame: TFrameNode): TAutoLayoutPadding => {
  const padding = getFramePadding(frame);
  const insideStroke = frame.insideStroke ?? InsideStroke.included;

  if (insideStroke === InsideStroke.included && frame.strokeWidth) {
    return {
      paddingBottom: padding.paddingBottom + frame.strokeWidth,
      paddingLeft: padding.paddingLeft + frame.strokeWidth,
      paddingRight: padding.paddingRight + frame.strokeWidth,
      paddingTop: padding.paddingTop + frame.strokeWidth,
    };
  }

  return padding;
};
