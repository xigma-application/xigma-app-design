// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorFillLoopPoints } from '../../getVectorFillLoopPoints/getVectorFillLoopPoints';

export type TOriginalFillPolygon = { key: string; polygon: TPoint[] };

export const getOriginalFillPolygons = (node: TVectorNode): TOriginalFillPolygon[] =>
  node.filledFaceKeys
    .map((key) => ({ key, polygon: getVectorFillLoopPoints(node, key) }))
    .filter((entry): entry is TOriginalFillPolygon => entry.polygon !== null);
