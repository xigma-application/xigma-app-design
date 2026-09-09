// types
import { LayoutVersion, StrokeAlign } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';

export const getAutoLayoutChildStrokeInset = (child: TAutoLayoutChildSize, layoutVersion: LayoutVersion): number => {
  if (layoutVersion === LayoutVersion.legacy || !child.strokeWidth) {
    return 0;
  }

  return child.strokeAlign === StrokeAlign.inside ? child.strokeWidth : 0;
};
