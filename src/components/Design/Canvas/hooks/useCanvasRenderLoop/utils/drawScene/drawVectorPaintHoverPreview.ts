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

export const drawVectorPaintHoverPreview = (context: TDrawSceneContext, nodes: Record<string, TSceneNode>, refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const hoveredFace = refs.hover.hoveredVectorPaintFaceKeyRef.current;
  const node = hoveredFace ? getVectorEditingNode(nodes, hoveredFace.nodeId) : null;

  if (node && hoveredFace) {
    const bakedNode = getRenderedVectorNode(node);
    const face = deriveVectorFaces(bakedNode).find((candidate) => candidate.key === hoveredFace.faceKey);

    if (face) {
      const color = hoveredFace.isFilled ? VECTOR_EDGE_HOVER_STROKE : DRAFT_FRAME_STROKE;
      drawVectorHatchFill(gl, program, buffer, [face.points], color, canvasWidth, canvasHeight, viewport, imageContext.isAlphaWriteEnabled);
    }
  }
};
