// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { drawVectorHatchFill } from 'utils/canvas/drawVectorNode/drawVectorHatchFill';
import { getRenderedVectorNode } from 'components/Design/Canvas/utils/getRenderedVectorNode';

export const drawShapeBuilderNodeFacesHatch = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode | null,
  faceKeys: Set<string> | undefined,
  color: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isAlphaWriteEnabled: boolean,
): void => {
  if (node && faceKeys) {
    const bakedNode = getRenderedVectorNode(node);
    const faces = deriveVectorFaces(bakedNode).filter((face) => faceKeys.has(face.key));

    faces.forEach((face) =>
      drawVectorHatchFill(gl, program, buffer, [face.points], color, canvasWidth, canvasHeight, viewport, isAlphaWriteEnabled),
    );
  }
};
