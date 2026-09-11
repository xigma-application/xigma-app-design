// types
import { InsideStroke, LayoutVersion, StrokeAlign } from 'types/design/enums';
import { TAutoLayoutPadding } from './getAutoLayoutContentBox';
import { TFrameNode } from 'types/design/types';

// utils
import { getFramePadding } from './getFramePadding';

const strokeAffectsLayout = (frame: TFrameNode, layoutVersion: LayoutVersion): boolean => {
  const isInsideStrokeIncluded = (frame.insideStroke ?? InsideStroke.included) === InsideStroke.included;

  switch (true) {
    case layoutVersion === LayoutVersion.legacy:
      return isInsideStrokeIncluded;
    case (frame.strokeAlign ?? StrokeAlign.center) === StrokeAlign.inside:
      return isInsideStrokeIncluded;
    default:
      return false;
  }
};

export const getFrameLayoutPadding = (frame: TFrameNode, layoutVersion: LayoutVersion = LayoutVersion.updated): TAutoLayoutPadding => {
  const padding = getFramePadding(frame);

  if (frame.strokeWidth && strokeAffectsLayout(frame, layoutVersion)) {
    return {
      paddingBottom: padding.paddingBottom + frame.strokeWidth,
      paddingLeft: padding.paddingLeft + frame.strokeWidth,
      paddingRight: padding.paddingRight + frame.strokeWidth,
      paddingTop: padding.paddingTop + frame.strokeWidth,
    };
  }

  return padding;
};
