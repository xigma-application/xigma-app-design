// types
import { TVectorNode } from 'types/design/types';

// utils
import { getRoundedVectorNode } from 'utils/canvas/vectorNetwork/roundVectorCorners/getRoundedVectorNode';
import { getSimpleVectorChain } from 'utils/canvas/vectorNetwork/getSimpleVectorChain/getSimpleVectorChain';
import {
  getStrokeOutlinePolygons,
  TStrokeOutlineLoops,
} from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';

export const getVectorStrokeOutlineLoops = (node: TVectorNode, halfWidth: number): TStrokeOutlineLoops | null => {
  const chain = getSimpleVectorChain(getRoundedVectorNode(node));
  return chain ? getStrokeOutlinePolygons(chain.points, halfWidth, chain.closed) : null;
};
