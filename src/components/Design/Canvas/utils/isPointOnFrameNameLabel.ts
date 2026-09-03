// types
import { TFrameNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getFrameNameLabelRects, isPointInFrameNameLabelRect } from './getFrameNameLabelRects';

export const isPointOnFrameNameLabel = (point: TPoint, frame: TFrameNode, zoom: number): boolean => {
  const [labelRect] = getFrameNameLabelRects([frame], zoom);

  return Boolean(labelRect && isPointInFrameNameLabelRect(point, labelRect));
};
