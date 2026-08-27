// types
import { TOriginalFillPolygon } from './getOriginalFillPolygons';
import { TVectorFace } from '../../deriveVectorFaces/types';

// utils
import { getCentroid } from './getCentroid';
import { getVectorFaceSignedArea } from '../../getVectorFaceSignedArea';
import { getVectorFillLoopKey } from '../../getVectorFillLoopKey';
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';

const MIN_FACE_AREA = 1e-2;

const isEntirelyCapsule = (face: TVectorFace, capsuleSegmentIds: Set<string>): boolean =>
  face.pieceKeys.every((pieceKey) => capsuleSegmentIds.has(pieceKey.split('[')[0]));

export type TSurvivingFace = { key: string; originalKey: string };

export const deriveFilledFaceKeys = (
  newFaces: TVectorFace[],
  originalFillPolygons: TOriginalFillPolygon[],
  capsuleSegmentIds: Set<string>,
): TSurvivingFace[] => [
  ...new Map(
    originalFillPolygons
      .flatMap(({ key: originalKey, polygon }) =>
        newFaces
          .filter((face) => Math.abs(getVectorFaceSignedArea(face.points)) >= MIN_FACE_AREA)
          .filter((face) => !isEntirelyCapsule(face, capsuleSegmentIds))
          .filter((face) => isPointInPolygonVertices(getCentroid(face.points), polygon))
          .map((face): TSurvivingFace => ({ key: getVectorFillLoopKey(face.pieceKeys), originalKey })),
      )
      .map((survivor) => [survivor.key, survivor] as const),
  ).values(),
];
