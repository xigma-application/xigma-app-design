// others
import { DRAFT_FRAME_STROKE, VECTOR_EDGE_HOVER_STROKE } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { drawVectorHatchFill } from 'utils/canvas/drawVectorNode/drawVectorHatchFill';
import { getRenderedVectorNode } from 'components/Design/Canvas/utils/getRenderedVectorNode';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';

export const drawVectorPaintTouchedFacesPreview = (
  context: TDrawSceneContext,
  nodes: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
): void => {
  const { buffer, gl, program, viewport } = context;
  const touchedFaces = refs.vectorPaint.vectorPaintTouchedFacesRef.current;
  const isRemoveMode = refs.vectorPaint.isVectorPaintRemoveRef.current;

  if (touchedFaces) {
    const faces = Object.entries(touchedFaces).flatMap(([nodeId, faceKeys]) => {
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

    drawVectorHatchFill(
      gl,
      program,
      buffer,
      faces,
      isRemoveMode ? VECTOR_EDGE_HOVER_STROKE : DRAFT_FRAME_STROKE,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
