// types
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';

export const getRoundedVectorSizes = (vectors: TVectorNode[]): { height: number; width: number }[] =>
  vectors
    .map((vector) => getVectorNodeBounds(vector))
    .map(({ height, width }) => ({
      height: Math.round(height * 100) / 100,
      width: Math.round(width * 100) / 100,
    }));
