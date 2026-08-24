// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';
import { ToolName } from 'types/design/enums';

// utils
import { armVectorGroupDrag } from '../armVectorGroupDrag';
import { bakeVectorNodeRotation } from '../../../../../utils/bakeVectorNodeRotation';
import { getVectorFaceAtPoint } from '../../../../../utils/getVectorFaceAtPoint';
import { getVectorFaceAtPointAcrossOpenNodes } from '../../../../../utils/getVectorFaceAtPointAcrossOpenNodes';
import { getVectorFaceVertexIds } from 'utils/canvas/vectorNetwork/getVectorFaceVertexIds';
import { persistVectorNetworkCrossings } from 'utils/canvas/vectorNetwork/planarizeVectorNetwork/persistVectorNetworkCrossings';

export const armVectorFaceSelectOnPointerDown = ({
  activeTool,
  canvas,
  canvasRefs,
  dispatch,
  event,
  point,
}: TArmContext): true | undefined => {
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  if (activeTool === ToolName.move && vectorEditingNodeIds.length > 0) {
    const hit = getVectorFaceAtPointAcrossOpenNodes(point, vectorEditingNodeIds, state.design.nodes);

    if (hit) {
      const { segments, vertices } = persistVectorNetworkCrossings(hit.node.segments, hit.node.vertices);
      const geometryChanged = segments !== hit.node.segments;
      const node = { ...hit.node, segments, vertices };
      const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
      const face = getVectorFaceAtPoint(point, bakedNode)!;
      const vertexIds = getVectorFaceVertexIds(face);

      if (geometryChanged) {
        dispatch(updateNode({ changes: { segments, vertices }, id: node.id }));
      }

      canvasRefs.selectedVectorVertexIdsRef.current = event.shiftKey
        ? [...new Set([...canvasRefs.selectedVectorVertexIdsRef.current, ...vertexIds])]
        : vertexIds;

      if (!event.shiftKey) {
        canvasRefs.selectedVectorHandlesRef.current = [];
        canvasRefs.selectedVectorSegmentIdsRef.current = [];
      }

      armVectorGroupDrag(canvas, event, canvasRefs, point, null);

      return true;
    }
  }
};
