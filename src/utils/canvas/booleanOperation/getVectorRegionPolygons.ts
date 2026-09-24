// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopPoints } from '../vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints';

export const getVectorRegionPolygons = (node: TVectorNode): TPoint[][] =>
  node.filledFaceKeys.length > 0
    ? node.filledFaceKeys.map((key) => getVectorFillLoopPoints(node, key)).filter((points): points is TPoint[] => Boolean(points))
    : deriveVectorFaces(node).map((face) => face.points);
