// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';

// utils
import { HANDLE_AXES } from '../../../../../utils/getResizeAxisAnchors';
import { getScaleAxisAnchors } from '../../../../../utils/getScaleAxisAnchors';

const resizeAxis = (anchorCoord: number, pointCoord: number, size: number, isCentered: boolean): number => {
  if (isCentered) {
    return anchorCoord - size / 2;
  }

  return pointCoord >= anchorCoord ? anchorCoord : anchorCoord - size;
};

export const getScaleBounds = (handle: TResizeHandle, bounds: TDraftRect, point: TPoint, aspectRatio: number): TDraftRect => {
  const anchor = getScaleAxisAnchors(handle, bounds);
  const axes = HANDLE_AXES[handle];
  const rawWidth = Math.abs(point.x - anchor.x);
  const rawHeight = Math.abs(point.y - anchor.y);
  const widthDrivesSize = rawWidth >= aspectRatio * rawHeight;
  const width = widthDrivesSize ? rawWidth : rawHeight * aspectRatio;
  const height = widthDrivesSize ? rawWidth / aspectRatio : rawHeight;

  return {
    height,
    width,
    x: resizeAxis(anchor.x, point.x, width, axes.x === 'none'),
    y: resizeAxis(anchor.y, point.y, height, axes.y === 'none'),
  };
};
