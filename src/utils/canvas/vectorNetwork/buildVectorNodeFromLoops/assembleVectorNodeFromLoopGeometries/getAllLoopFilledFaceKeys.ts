// types
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

export const getAllLoopFilledFaceKeys = (node: TVectorNode): string[] =>
  deriveVectorFaces(node).map((face) => getVectorFillLoopKey(face.pieceKeys));
