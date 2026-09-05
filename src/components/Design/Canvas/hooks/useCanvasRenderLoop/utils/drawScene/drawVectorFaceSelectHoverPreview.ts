// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { drawVectorHatchFill } from 'utils/canvas/drawVectorNode/drawVectorHatchFill';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';

export const drawVectorFaceSelectHoverPreview = (
  context: TDrawSceneContext,
  nodes: Record<string, TSceneNode>,
  refs: TCanvasRefs,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const hoveredFace = refs.hover.hoveredVectorFaceSelectRef.current;
  const node = hoveredFace ? getVectorEditingNode(nodes, hoveredFace.nodeId) : null;

  if (node && hoveredFace) {
    const bakedNode = getRenderedVectorNode(node);
    const face = deriveVectorFaces(bakedNode).find((candidate) => candidate.key === hoveredFace.faceKey);

    if (face) {
      drawVectorHatchFill(
        gl,
        program,
        buffer,
        [face.points],
        DRAFT_FRAME_STROKE,
        canvasWidth,
        canvasHeight,
        viewport,
        imageContext.isAlphaWriteEnabled,
      );
    }
  }
};
