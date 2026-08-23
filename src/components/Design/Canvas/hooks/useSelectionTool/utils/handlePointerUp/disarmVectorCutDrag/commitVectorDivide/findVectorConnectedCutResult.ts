// types
import { TPoint } from 'types/canvas';
import { TVectorConnectedCutResult } from './types';
import { TVectorNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from '../../../../../../utils/bakeVectorNodeRotation';
import { materializeVectorNetworkCut } from 'utils/canvas/vectorNetwork/cutVectorNetwork/materializeVectorNetworkCut/materializeVectorNetworkCut';

export const findVectorConnectedCutResult = (node: TVectorNode, lineStart: TPoint, lineEnd: TPoint): TVectorConnectedCutResult | null => {
  const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
  const materialized = materializeVectorNetworkCut(bakedNode, lineStart, lineEnd);

  return materialized && { node, ...materialized };
};
