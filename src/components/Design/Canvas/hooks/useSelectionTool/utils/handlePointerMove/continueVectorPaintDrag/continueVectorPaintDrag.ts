// store
import { selectPaintColor, selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs, TVectorDraggedFillFaces } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getPointerPosition } from '../../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { paintNodeAlongPath } from './paintNodeAlongPath';
import { screenToWorld } from '../../../../../utils/screenToWorld';

// others
import { MIN_DRAG_DISTANCE_PX } from '../../../../../constants';

export const continueVectorPaintDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
): void => {
  const path = canvasRefs.vectorPaintPathRef.current;

  if (path) {
    const state = store.getState();
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const nextPath = [...path, point];

    canvasRefs.vectorPaintPathRef.current = nextPath;

    const [start] = nextPath;
    const hasDragged = nextPath.some(
      (pathPoint) => Math.hypot(pathPoint.x - start.x, pathPoint.y - start.y) >= MIN_DRAG_DISTANCE_PX / viewport.zoom,
    );

    if (hasDragged) {
      const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
      const paintColor = selectPaintColor(state);
      const isRemoveMode = canvasRefs.isVectorPaintRemoveRef.current;
      const touchedLoopKeys = canvasRefs.touchedVectorPaintLoopKeysRef.current;
      const touchedFaces: TVectorDraggedFillFaces = {};

      vectorEditingNodeIds
        .map((nodeId) => getVectorEditingNode(state.design.nodes, nodeId))
        .filter((node): node is TVectorNode => node !== null)
        .forEach((node) => {
          touchedFaces[node.id] = paintNodeAlongPath(dispatch, node, nextPath, paintColor, isRemoveMode, touchedLoopKeys);
        });

      canvasRefs.vectorPaintTouchedFacesRef.current = touchedFaces;
    }
  }
};
