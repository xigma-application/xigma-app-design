// types
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

export type TClosedLoopFillData = { fillColorOverrideByKey: Record<string, string>; filledFaceKeys: string[] };

export const getFillDataForClosedLoop = (node: TVectorNode, fillColor: string): TClosedLoopFillData => {
  const filledFaceKeys = deriveVectorFaces(node).map((face) => getVectorFillLoopKey(face.pieceKeys));
  return { fillColorOverrideByKey: Object.fromEntries(filledFaceKeys.map((key) => [key, fillColor])), filledFaceKeys };
};
