// store
import { selectPaintColor, selectVectorEditingNodeIds } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';
import { TVectorNode } from 'types/design/types';
import { TVectorPaintTouchedLoopKeys } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { bakeVectorNodeRotation } from '../../../../../utils/bakeVectorNodeRotation';
import { getVectorFaceAtPoint } from '../../../../../utils/getVectorFaceAtPoint';
import { getVectorFaceAtPointAcrossOpenNodes } from '../../../../../utils/getVectorFaceAtPointAcrossOpenNodes';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';
import { getVectorFillLoopKeyAtPoint } from 'utils/canvas/vectorNetwork/getVectorFillLoopKeyAtPoint';
import { persistVectorNetworkCrossings } from 'utils/canvas/vectorNetwork/planarizeVectorNetwork/persistVectorNetworkCrossings';

export const armVectorPaintOnPointerDown = ({
  activeTool,
  canvas,
  canvasRefs,
  dispatch,
  event,
  point,
  setClassName,
}: TArmContext): true | undefined => {
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  if (activeTool === ToolName.paint && vectorEditingNodeIds.length > 0) {
    const hit = getVectorFaceAtPointAcrossOpenNodes(point, vectorEditingNodeIds, state.design.pages[state.design.activePageId].nodes);
    const touchedLoopKeys: TVectorPaintTouchedLoopKeys = {};

    if (hit) {
      const { segments, vertices } = persistVectorNetworkCrossings(hit.node.segments, hit.node.vertices);
      const geometryChanged = segments !== hit.node.segments;
      const node = { ...hit.node, segments, vertices };
      const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
      const face = getVectorFaceAtPoint(point, bakedNode)!;
      const existingLoopKey = getVectorFillLoopKeyAtPoint(node, point);
      const newLoopKey = getVectorFillLoopKey(face.pieceKeys);
      const filledFaceKeys = existingLoopKey
        ? node.filledFaceKeys.filter((key) => key !== existingLoopKey)
        : [...node.filledFaceKeys, newLoopKey];
      const fillColorOverrideByKey = existingLoopKey
        ? node.fillColorOverrideByKey
        : { ...node.fillColorOverrideByKey, [newLoopKey]: selectPaintColor(state) };
      const changes: Partial<TVectorNode> = geometryChanged
        ? { fillColorOverrideByKey, filledFaceKeys, segments, vertices }
        : { fillColorOverrideByKey, filledFaceKeys };

      dispatch(updateNode({ changes, id: node.id }));
      touchedLoopKeys[node.id] = existingLoopKey ? new Set() : new Set([newLoopKey]);
      canvasRefs.vectorPaint.vectorPaintTouchedFacesRef.current = { [node.id]: [face.key] };
      canvasRefs.vectorPaint.isVectorPaintRemoveRef.current = Boolean(existingLoopKey);
    } else {
      canvasRefs.vectorPaint.vectorPaintTouchedFacesRef.current = {};
      canvasRefs.vectorPaint.isVectorPaintRemoveRef.current = false;
    }

    canvasRefs.vectorPaint.vectorPaintPathRef.current = [point];
    canvasRefs.vectorPaint.touchedVectorPaintLoopKeysRef.current = touchedLoopKeys;
    canvas.setPointerCapture(event.pointerId);
    setClassName(canvasRefs.vectorPaint.isVectorPaintRemoveRef.current ? 'paint-remove' : 'paint-add');

    return true;
  }
};
