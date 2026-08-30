// others
import { LINE_ENDPOINT_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getPathTextHandlePoint } from './getPathTextHandlePoint';

export const isPointOnPathTextHandle = (point: TPoint, box: TEditingTextBox, viewport: TViewport, pathNode?: TSceneNode): boolean => {
  const handlePoint = getPathTextHandlePoint(box, pathNode);
  const radius = LINE_ENDPOINT_HANDLE_HIT_RADIUS_PX / viewport.zoom;

  return Boolean(handlePoint && Math.hypot(point.x - handlePoint.x, point.y - handlePoint.y) <= radius);
};
