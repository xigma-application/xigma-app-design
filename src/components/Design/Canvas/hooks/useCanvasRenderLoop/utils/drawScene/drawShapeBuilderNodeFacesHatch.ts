// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from 'components/Design/Canvas/utils/bakeVectorNodeRotation';
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces';
import { drawVectorHatchFill } from 'utils/canvas/drawVectorNode/drawVectorHatchFill';

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
): void => {
  if (node && faceKeys) {
    const bakedNode: TVectorNode = node.rotation ? { ...node, ...bakeVectorNodeRotation(node) } : node;
    const faces = deriveVectorFaces(bakedNode).filter((face) => faceKeys.has(face.key));

    faces.forEach((face) => drawVectorHatchFill(gl, program, buffer, [face.points], color, canvasWidth, canvasHeight, viewport));
  }
};
