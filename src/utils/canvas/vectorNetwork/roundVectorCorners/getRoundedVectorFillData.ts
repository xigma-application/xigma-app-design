// types
import { TRoundedVectorNetwork } from './roundVectorNetworkCorners';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../deriveVectorFaces/deriveVectorFaces';
import { getOriginalVectorFaceKey } from './getOriginalVectorFaceKey';
import { getVectorFillLoopKey } from '../getVectorFillLoopKey';

export type TRoundedVectorFillData = Pick<TVectorNode, 'fillByKey' | 'filledFaceKeys' | 'holeParentByKey'>;

const remapKeys = <T>(record: Record<string, T>, keyByOriginal: Map<string, string | undefined>): [string, T][] =>
  Object.entries(record).flatMap(([key, value]) => {
    const nextKey = keyByOriginal.get(key);
    return nextKey ? [[nextKey, value]] : [];
  });

const remapHoleParents = (holeParentByKey: Record<string, string>, keyByOriginal: Map<string, string | undefined>): [string, string][] =>
  remapKeys(holeParentByKey, keyByOriginal).flatMap(([key, parent]) => {
    const nextParent = keyByOriginal.get(parent);
    return nextParent ? [[key, nextParent]] : [];
  });

export const getRoundedVectorFillData = (node: TVectorNode, network: TRoundedVectorNetwork): TRoundedVectorFillData => {
  const isFilled = node.filledFaceKeys.length > 0;
  const roundedFaces = isFilled ? deriveVectorFaces({ ...node, ...network }) : [];
  const originalFaces = isFilled ? deriveVectorFaces(node) : [];
  const loopKeyByFaceKey = new Map(roundedFaces.map((face) => [getOriginalVectorFaceKey(face.key), getVectorFillLoopKey(face.pieceKeys)]));
  const keyByOriginal = new Map(originalFaces.map((face) => [getVectorFillLoopKey(face.pieceKeys), loopKeyByFaceKey.get(face.key)]));

  return {
    fillByKey: Object.fromEntries(remapKeys(node.fillByKey ?? {}, keyByOriginal)),
    filledFaceKeys: remapKeys(Object.fromEntries(node.filledFaceKeys.map((key) => [key, key])), keyByOriginal).map(([key]) => key),
    holeParentByKey: Object.fromEntries(remapHoleParents(node.holeParentByKey ?? {}, keyByOriginal)),
  };
};
