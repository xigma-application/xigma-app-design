// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectActiveTool, selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';
import { ToolName } from 'types/design/enums';

// utils
import { commitVectorBendSegment } from '../../../../../utils/commitVectorBendSegment';
import { getAllVectorEdgeMatchesAtPointAcrossOpenNodes } from '../../../../../utils/getAllVectorEdgeMatchesAtPointAcrossOpenNodes';
import { getVectorBendDragCandidates } from '../../../../../utils/getVectorBendDragCandidates';

export const armVectorBendSegmentOnPointerDown = ({
  canvas,
  canvasRefs,
  dispatch,
  event,
  point,
  selectionRefs,
  viewport,
}: TArmContext): true | undefined => {
  if (event.ctrlKey || event.metaKey || selectActiveTool(store.getState()) === ToolName.bend) {
    const state = store.getState();
    const result = getAllVectorEdgeMatchesAtPointAcrossOpenNodes(
      point,
      selectVectorEditingNodeIds(state),
      state.design.nodes,
      VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
      VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
    );

    if (result) {
      const { matches, node } = result;

      if (matches.length === 1) {
        commitVectorBendSegment(node, matches[0].segmentId, point, dispatch, canvasRefs, selectionRefs.vectorSegmentBendDragRef);
        canvas.setPointerCapture(event.pointerId);

        return true;
      }

      // matches.length is always >= 1 here (getAllVectorEdgeMatchesAtPointAcrossOpenNodes only returns a
      // result for a node with at least one match), so falling past the ===1 case above means > 1
      selectionRefs.vectorSegmentBendDragRef.current = {
        candidates: getVectorBendDragCandidates(matches, node, point),
        dragStart: point,
        nodeId: node.id,
        status: 'pending',
      };
      canvas.setPointerCapture(event.pointerId);

      return true;
    }
  }
};
