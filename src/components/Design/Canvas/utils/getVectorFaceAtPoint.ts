// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces';
import { isPointInPolygonVertices } from './isPointInPolygonVertices';

export const getVectorFaceAtPoint = (point: TPoint, node: TVectorNode): string | null =>
  deriveVectorFaces(node).find((face) => isPointInPolygonVertices(point, face.points))?.key ?? null;
