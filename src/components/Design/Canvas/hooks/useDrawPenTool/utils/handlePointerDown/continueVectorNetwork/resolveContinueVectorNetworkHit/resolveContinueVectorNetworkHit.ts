// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppStore } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';
import { TContinueVectorNetworkHit } from '../types';

// utils
import { getCrossNodeEdgeHit } from './getCrossNodeEdgeHit';
import { getCrossNodeVertexHover } from './getCrossNodeVertexHover';
import { getEdgeHit } from './getEdgeHit';
import { getVectorVertexAtPoint } from '../../../../../../utils/getVectorVertexAtPoint';

export const resolveContinueVectorNetworkHit = (
  point: TPoint,
  node: TVectorNode,
  activeVertexId: string,
  viewport: TViewport,
  appStore: AppStore,
): TContinueVectorNetworkHit => {
  const state = appStore.getState();
  const otherOpenNodeIds = selectVectorEditingNodeIds(state).filter((id) => id !== node.id);
  const hover = getVectorVertexAtPoint(point, node, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom, activeVertexId);
  const crossNodeVertexHover = getCrossNodeVertexHover(point, hover, otherOpenNodeIds, state.design.nodes, viewport);
  const edgeHit = getEdgeHit(point, node, hover, crossNodeVertexHover, viewport);
  const crossNodeEdgeHit = getCrossNodeEdgeHit(point, hover, crossNodeVertexHover, edgeHit, otherOpenNodeIds, state.design.nodes, viewport);

  switch (true) {
    case hover !== null:
      return { kind: 'vertex', vertexId: hover.vertexId };
    case crossNodeVertexHover !== null:
      return { kind: 'crossNodeVertex', targetNode: crossNodeVertexHover.node, vertexId: crossNodeVertexHover.vertexId };
    case edgeHit !== null:
      return { kind: 'edge', segmentId: edgeHit.segmentId, t: edgeHit.t };
    case crossNodeEdgeHit !== null:
      return {
        kind: 'crossNodeEdge',
        segmentId: crossNodeEdgeHit.hit.segmentId,
        t: crossNodeEdgeHit.hit.t,
        targetNode: crossNodeEdgeHit.node,
      };
    default:
      return { kind: 'extend' };
  }
};
