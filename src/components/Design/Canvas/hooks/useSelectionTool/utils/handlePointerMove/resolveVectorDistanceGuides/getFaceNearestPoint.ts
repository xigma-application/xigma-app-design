// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { projectPointOntoPolyline } from '../../../../../utils/getVectorDistanceGuides/projectPointOntoPolyline';

export const getFaceNearestPoint = (bakedNodes: TVectorNode[], nodeId: string, faceKey: string, fromPoint: TPoint): TPoint | null => {
  const node = bakedNodes.find((candidate) => candidate.id === nodeId);
  const face = node ? deriveVectorFaces(node).find((candidate) => candidate.key === faceKey) : undefined;

  return face ? projectPointOntoPolyline(fromPoint, [...face.points, face.points[0]]).foot : null;
};
