// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces, TVectorFace } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { isPointInPolygonVertices } from './isPointInPolygonVertices';

export const getVectorFacesOnPath = (node: TVectorNode, path: TPoint[]): TVectorFace[] =>
  deriveVectorFaces(node).filter((face) => path.some((point) => isPointInPolygonVertices(point, face.points)));
