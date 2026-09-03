// others
import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP_EPSILON, ZOOM_STEP_PRESETS } from '../constants';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getZoomToViewport } from './getZoomToViewport';

export const getSteppedZoomViewport = (viewport: TViewport, direction: 'in' | 'out', anchor: TPoint): TViewport => {
  const nextZoom =
    direction === 'in'
      ? (ZOOM_STEP_PRESETS.find((preset) => preset > viewport.zoom + ZOOM_STEP_EPSILON) ?? ZOOM_MAX)
      : ([...ZOOM_STEP_PRESETS].reverse().find((preset) => preset < viewport.zoom - ZOOM_STEP_EPSILON) ?? ZOOM_MIN);

  return getZoomToViewport(viewport, nextZoom, anchor);
};
