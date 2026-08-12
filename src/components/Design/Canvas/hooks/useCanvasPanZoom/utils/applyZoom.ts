import clamp from 'lodash/clamp';

// others
import { ZOOM_DELTA_THRESHOLD, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP_TRACKPAD, ZOOM_STEP_WHEEL } from '../../../constants';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { screenToWorld } from '../../../utils/screenToWorld';

export const applyZoom = (viewport: TViewport, deltaY: number, cursor: TPoint): TViewport => {
  const step = Math.abs(deltaY) < ZOOM_DELTA_THRESHOLD ? ZOOM_STEP_TRACKPAD : ZOOM_STEP_WHEEL;
  const direction = deltaY < 0 ? 1 : -1;
  const nextZoom = clamp(viewport.zoom * (1 + direction * step), ZOOM_MIN, ZOOM_MAX);
  const worldPoint = screenToWorld(cursor, viewport);

  return {
    x: cursor.x - worldPoint.x * nextZoom,
    y: cursor.y - worldPoint.y * nextZoom,
    zoom: nextZoom,
  };
};
