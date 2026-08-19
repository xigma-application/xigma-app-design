// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getNodeAtPoint } from '../../../../../utils/getNodeAtPoint';

export const resolvePlainNodeHover = ({ point, orderedNodes, viewport }: THoverResolverContext): THoverResult => {
  const hit = getNodeAtPoint(point, orderedNodes, viewport);

  return { className: null, cursor: '', nodeId: hit?.id ?? null };
};
