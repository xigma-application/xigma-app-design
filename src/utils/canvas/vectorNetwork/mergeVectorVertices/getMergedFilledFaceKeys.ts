// types
import { TVectorSegment } from 'types/design/types';
import { TVectorNetworkData } from './types';

export const getMergedFilledFaceKeys = (
  sourceNode: TVectorNetworkData,
  targetNode: TVectorNetworkData,
  segments: Record<string, TVectorSegment>,
): string[] =>
  Array.from(new Set([...sourceNode.filledFaceKeys, ...targetNode.filledFaceKeys])).filter((key) =>
    key.split(',').every((pieceKey) => pieceKey.split('[')[0] in segments),
  );
