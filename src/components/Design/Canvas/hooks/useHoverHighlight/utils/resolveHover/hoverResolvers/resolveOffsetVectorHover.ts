// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getOffsetVectorEdgeAtPoint } from 'utils/canvas/offsetVector/getOffsetVectorEdgeAtPoint';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { isOffsetVectorNode } from 'utils/canvas/offsetVector/isOffsetVectorNode';

export const resolveOffsetVectorHover = ({
  nodesById,
  offsetVector,
  point,
  refs,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const node = offsetVector ? nodesById[offsetVector.nodeId] : undefined;

  if (offsetVector && isOffsetVectorNode(node)) {
    const hit = getOffsetVectorEdgeAtPoint(point, node, offsetVector, viewport);
    const angle = refs.offsetVector.offsetVectorDragRef.current?.angle ?? hit?.angle;

    setRef(refs.offsetVector, 'hoveredOffsetVectorEdgeRef', hit);

    return { className: null, cursor: angle === undefined ? '' : (getRotatedCursorUrl('resize', angle) ?? ''), nodeId: null };
  }
};
