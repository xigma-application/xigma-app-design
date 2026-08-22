// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces, TVectorFace } from 'utils/canvas/vectorNetwork/deriveVectorFaces';
import { isPointInPolygonVertices } from './isPointInPolygonVertices';

export const getVectorFaceAtPoint = (point: TPoint, node: TVectorNode): TVectorFace | null =>
  deriveVectorFaces(node).find((face) => isPointInPolygonVertices(point, face.points)) ?? null;
