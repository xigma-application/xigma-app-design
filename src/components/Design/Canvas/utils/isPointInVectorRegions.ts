// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces';
import { isPointInPolygonVertices } from './isPointInPolygonVertices';

export const isPointInVectorRegions = (point: TPoint, node: TVectorNode): boolean =>
  deriveVectorFaces(node).some((face) => isPointInPolygonVertices(point, face));
