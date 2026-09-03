import clamp from 'lodash/clamp';

// others
import { ZOOM_MAX, ZOOM_MIN } from '../constants';

// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getRectCenter } from './getRectCenter';

export const getFitViewport = (bounds: TDraftRect, visibleRect: TDraftRect, paddingPx: number): TViewport => {
  const availableWidth = Math.max(visibleRect.width - paddingPx * 2, 1);
  const availableHeight = Math.max(visibleRect.height - paddingPx * 2, 1);
  const zoom = clamp(Math.min(availableWidth / bounds.width, availableHeight / bounds.height), ZOOM_MIN, ZOOM_MAX);
  const worldCenter = getRectCenter(bounds);
  const screenCenter = getRectCenter(visibleRect);

  return {
    x: screenCenter.x - worldCenter.x * zoom,
    y: screenCenter.y - worldCenter.y * zoom,
    zoom,
  };
};
