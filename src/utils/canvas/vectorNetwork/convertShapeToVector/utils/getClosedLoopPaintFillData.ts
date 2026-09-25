// types
import { TPaint } from 'types/design/paint/types';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

export type TClosedLoopFillData = { fillByKey: Record<string, TPaint[]>; filledFaceKeys: string[] };

export const getClosedLoopPaintFillData = (node: TVectorNode, paints: TPaint[]): TClosedLoopFillData => {
  const filledFaceKeys = deriveVectorFaces(node).map((face) => getVectorFillLoopKey(face.pieceKeys));
  return { fillByKey: Object.fromEntries(filledFaceKeys.map((key) => [key, paints])), filledFaceKeys };
};
