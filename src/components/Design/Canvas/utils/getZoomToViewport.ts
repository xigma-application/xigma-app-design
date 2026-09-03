import clamp from 'lodash/clamp';

// others
import { ZOOM_MAX, ZOOM_MIN } from '../constants';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { screenToWorld } from './screenToWorld';

export const getZoomToViewport = (viewport: TViewport, targetZoom: number, anchor: TPoint): TViewport => {
  const nextZoom = clamp(targetZoom, ZOOM_MIN, ZOOM_MAX);
  const worldPoint = screenToWorld(anchor, viewport);

  return {
    x: anchor.x - worldPoint.x * nextZoom,
    y: anchor.y - worldPoint.y * nextZoom,
    zoom: nextZoom,
  };
};
