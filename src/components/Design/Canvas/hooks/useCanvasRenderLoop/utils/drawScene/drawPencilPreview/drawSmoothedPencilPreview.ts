// others
import { PENCIL_NAME, PENCIL_STROKE, PENCIL_STROKE_WIDTH, PENCIL_TANGENT_TENSION } from '../../../../../constants';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { buildVectorNetworkFromPoints } from '../../../../useDrawPencilTool/utils/handlePointerUp/buildVectorNetworkFromPoints';
import { drawVectorRoundedCaps } from 'utils/canvas/drawVectorNode/drawVectorRoundedCaps';
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { flattenVectorSegments } from 'utils/canvas/vectorNetwork/flattenVectorSegments';

export const drawSmoothedPencilPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  points: TPoint[] | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (points && points.length > 1) {
    const { segments, vertexHandleModes, vertices } = buildVectorNetworkFromPoints(points, PENCIL_TANGENT_TENSION);
    const previewNode: TVectorNode = {
      capStyle: 'round',
      fillColor: null,
      filledFaceKeys: [],
      id: 'pencil-preview',
      name: PENCIL_NAME,
      parentId: null,
      rotation: 0,
      segments,
      strokeColor: PENCIL_STROKE,
      strokeWidth: PENCIL_STROKE_WIDTH,
      type: NodeType.vector,
      vertexHandleModes,
      vertices,
    };

    drawVectorStroke(
      gl,
      program,
      buffer,
      flattenVectorSegments(previewNode),
      PENCIL_STROKE,
      PENCIL_STROKE_WIDTH,
      canvasWidth,
      canvasHeight,
      viewport,
    );
    drawVectorRoundedCaps(gl, program, buffer, previewNode, canvasWidth, canvasHeight, viewport);
  }
};
