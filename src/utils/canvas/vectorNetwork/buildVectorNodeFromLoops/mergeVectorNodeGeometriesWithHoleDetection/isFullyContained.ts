// types
import { TNodeFace } from './types';

// utils
import { isBoundsFullyInside } from './isBoundsFullyInside';
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';

export const isFullyContained = (face: TNodeFace, container: TNodeFace): boolean =>
  isBoundsFullyInside(face.bounds, container.bounds) && face.points.every((p) => isPointInPolygonVertices(p, container.points));
