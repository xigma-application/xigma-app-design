// store
import { selectVectorEditingNodeId, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { getVectorPointsInPolygon } from 'utils/canvas/vectorNetwork/getVectorPointsInPolygon';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continueVectorLassoDrag = (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs): void => {
  if (canvasRefs.vectorLassoPathRef.current) {
    const state = store.getState();
    const node = getVectorEditingNode(state.design.nodes, selectVectorEditingNodeId(state));

    if (node) {
      const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
      const path = [...canvasRefs.vectorLassoPathRef.current, point];

      canvasRefs.vectorLassoPathRef.current = path;
      canvasRefs.selectedVectorVertexIdsRef.current = getVectorPointsInPolygon(node, path);
    }
  }
};
