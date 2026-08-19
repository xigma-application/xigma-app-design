// types
import { NodeType } from 'types/design/enums';
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getLineEndpointAtPoint } from '../../../../../utils/getLineEndpointAtPoint';

export const resolveLineEndpointHover = ({ point, resizableSelectedNodes, viewport }: THoverResolverContext): THoverResult | undefined => {
  const [selectedNode] = resizableSelectedNodes;
  const lineEndpointHit = getLineEndpointAtPoint(point, resizableSelectedNodes, viewport);

  if (lineEndpointHit && selectedNode.type === NodeType.line) {
    return { className: 'positioning', cursor: '', nodeId: lineEndpointHit.nodeId };
  }
};
