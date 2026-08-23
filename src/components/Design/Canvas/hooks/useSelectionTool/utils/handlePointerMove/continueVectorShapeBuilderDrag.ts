// store
import { selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorFacesInRectAcrossOpenNodes } from '../../../../utils/getVectorFacesInRectAcrossOpenNodes';
import { getVectorFacesOnPathAcrossOpenNodes } from '../../../../utils/getVectorFacesOnPathAcrossOpenNodes';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { toDraftRect } from '../../../../utils/toDraftRect';

export const continueVectorShapeBuilderDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const path = canvasRefs.vectorShapeBuilderPathRef.current;

  if (path) {
    const state = store.getState();
    const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
    const nextPath = [...path, point];

    canvasRefs.vectorShapeBuilderPathRef.current = nextPath;
    canvasRefs.isVectorShapeBuilderBoxModeRef.current = event.shiftKey;
    canvasRefs.isVectorShapeBuilderSubtractRef.current = event.altKey;
    setClassName(event.altKey ? 'remove' : 'add');

    const hits = event.shiftKey
      ? getVectorFacesInRectAcrossOpenNodes(toDraftRect(nextPath[0], point), vectorEditingNodeIds, state.design.nodes)
      : getVectorFacesOnPathAcrossOpenNodes(nextPath, vectorEditingNodeIds, state.design.nodes);
    const touchedFaces = canvasRefs.touchedVectorShapeBuilderFacesRef.current;

    hits.forEach(({ faces, node }) => {
      const faceKeys = touchedFaces[node.id] ?? new Set<string>();

      faces.forEach((face) => faceKeys.add(face.key));
      touchedFaces[node.id] = faceKeys;
    });
  }
};
