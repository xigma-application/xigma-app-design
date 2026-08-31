// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { drawVectorHatchFill } from 'utils/canvas/drawVectorNode/drawVectorHatchFill';
import { getRenderedVectorNode } from 'components/Design/Canvas/utils/getRenderedVectorNode';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';

export const drawVectorFaceSelectHoverPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  nodes: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const hoveredFace = refs.hover.hoveredVectorFaceSelectRef.current;
  const node = hoveredFace ? getVectorEditingNode(nodes, hoveredFace.nodeId) : null;

  if (node && hoveredFace) {
    const bakedNode = getRenderedVectorNode(node);
    const face = deriveVectorFaces(bakedNode).find((candidate) => candidate.key === hoveredFace.faceKey);

    if (face) {
      drawVectorHatchFill(gl, program, buffer, [face.points], DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport);
    }
  }
};
