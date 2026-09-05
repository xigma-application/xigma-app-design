// store
import { selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TVectorFace } from 'utils/canvas/vectorNetwork/deriveVectorFaces/types';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getVectorFacesInRectAcrossOpenNodes } from '../../../../utils/getVectorFacesInRectAcrossOpenNodes';
import { getVectorFacesOnPathAcrossOpenNodes } from '../../../../utils/getVectorFacesOnPathAcrossOpenNodes';
import { screenToWorld } from 'utils/transform/screenToWorld';
import { toDraftRect } from '../../../../utils/toDraftRect';

const getShapeBuilderHits = (
  isBoxMode: boolean,
  nextPath: TPoint[],
  point: TPoint,
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
): { faces: TVectorFace[]; node: TVectorNode }[] =>
  isBoxMode
    ? getVectorFacesInRectAcrossOpenNodes(toDraftRect(nextPath[0], point), vectorEditingNodeIds, nodes)
    : getVectorFacesOnPathAcrossOpenNodes(nextPath, vectorEditingNodeIds, nodes);

export const continueVectorShapeBuilderDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const path = canvasRefs.shapeBuilder.vectorShapeBuilderPathRef.current;

  if (path) {
    const state = store.getState();
    const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
    const nextPath = [...path, point];
    const nodes = state.design.pages[state.design.activePageId].nodes;

    canvasRefs.shapeBuilder.vectorShapeBuilderPathRef.current = nextPath;
    canvasRefs.shapeBuilder.isVectorShapeBuilderBoxModeRef.current = event.shiftKey;
    canvasRefs.shapeBuilder.isVectorShapeBuilderSubtractRef.current = event.altKey;
    setClassName(event.altKey ? 'remove' : 'add');

    const hits = getShapeBuilderHits(event.shiftKey, nextPath, point, vectorEditingNodeIds, nodes);
    const touchedFaces = canvasRefs.shapeBuilder.touchedVectorShapeBuilderFacesRef.current;

    hits.forEach(({ faces, node }) => {
      const faceKeys = touchedFaces[node.id] ?? new Set<string>();

      faces.forEach((face) => faceKeys.add(face.key));
      touchedFaces[node.id] = faceKeys;
    });
  }
};
