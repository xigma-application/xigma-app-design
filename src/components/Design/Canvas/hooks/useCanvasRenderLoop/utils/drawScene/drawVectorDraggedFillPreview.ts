// others
import { VECTOR_EDGE_HOVER_STROKE } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { drawVectorHatchFill } from 'utils/canvas/drawVectorNode/drawVectorHatchFill';
import { getRenderedVectorNode } from 'components/Design/Canvas/utils/getRenderedVectorNode';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';

export const drawVectorDraggedFillPreview = (
  context: TDrawSceneContext,
  nodes: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
): void => {
  const { buffer, gl, program, viewport } = context;
  const draggedFillFaces = refs.vectorSnapshots.draggedVectorFillFacesRef.current;

  if (draggedFillFaces) {
    const faces = Object.entries(draggedFillFaces).flatMap(([nodeId, faceKeys]) => {
      const node = getVectorEditingNode(nodes, nodeId);

      if (node) {
        const bakedNode = getRenderedVectorNode(node);
        const faceKeySet = new Set(faceKeys);

        return deriveVectorFaces(bakedNode)
          .filter((face) => faceKeySet.has(face.key))
          .map((face) => face.points);
      }

      return [];
    });

    drawVectorHatchFill(gl, program, buffer, faces, VECTOR_EDGE_HOVER_STROKE, canvasWidth, canvasHeight, viewport);
  }
};
