// types
import { TDraftRect } from 'types/canvas';

export const getAutoLayoutRowFrame = (isHorizontal: boolean, contentBox: TDraftRect, bandStart: number, bandEnd: number): TDraftRect =>
  isHorizontal
    ? { height: bandEnd - bandStart, width: contentBox.width, x: contentBox.x, y: contentBox.y + bandStart }
    : { height: contentBox.height, width: bandEnd - bandStart, x: contentBox.x + bandStart, y: contentBox.y };
