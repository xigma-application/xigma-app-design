// store
import { selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { getVectorPointsInPolygon } from 'utils/canvas/vectorNetwork/getVectorPointsInPolygon';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const continueVectorLassoDrag = (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs): void => {
  if (canvasRefs.lassoMarquee.vectorLassoPathRef.current) {
    const state = store.getState();
    const openNodes = selectVectorEditingNodeIds(state)
      .map((id) => getVectorEditingNode(state.design.pages[state.design.activePageId].nodes, id))
      .filter((node): node is TVectorNode => node !== null);

    if (openNodes.length > 0) {
      const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
      const path = [...canvasRefs.lassoMarquee.vectorLassoPathRef.current, point];

      canvasRefs.lassoMarquee.vectorLassoPathRef.current = path;
      canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = openNodes.flatMap((node) => getVectorPointsInPolygon(node, path));
    }
  }
};
