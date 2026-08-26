// types
import { TVectorFace } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';

export const getVectorFaceRealSegmentIds = (face: TVectorFace): string[] => [
  ...new Set(face.pieceKeys.map((pieceKey) => pieceKey.split('[')[0])),
];
