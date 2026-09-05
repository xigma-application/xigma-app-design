// others
import { DRAFT_FRAME_STROKE, HOVER_OUTLINE_WIDTH } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TTextNode, TViewport } from 'types/design/types';

// utils
import { drawTextHoverUnderline } from './drawTextHoverUnderline';
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { flattenVectorSegments } from 'utils/canvas/vectorNetwork/flattenVectorSegments';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { mirrorGuideVectorForText } from 'utils/canvas/text/mirrorGuideVectorForText';

export const drawTextHoverOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  hoveredNode: TTextNode,
  nodesById: Record<string, TSceneNode>,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const textPathNode = hoveredNode.pathId ? nodesById[hoveredNode.pathId] : undefined;

  if (textPathNode?.type !== NodeType.vector) {
    drawTextHoverUnderline(gl, program, buffer, hoveredNode, canvasWidth, canvasHeight, viewport);
  } else {
    drawVectorStroke(
      gl,
      program,
      buffer,
      flattenVectorSegments(getRenderedVectorNode(mirrorGuideVectorForText(textPathNode, nodesById))),
      DRAFT_FRAME_STROKE,
      HOVER_OUTLINE_WIDTH / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
