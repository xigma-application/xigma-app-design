// types
import { TDrawSceneContext } from './types';
import { TMediaNode } from 'types/design/types';

// utils
import { drawImage } from 'utils/canvas/drawImage';
import { getOrLoadTexture } from 'utils/canvas/getOrLoadTexture';

export const drawMediaLeafNode = (context: TDrawSceneContext, node: TMediaNode): void => {
  const { canvasHeight, canvasWidth, gl, imageContext, viewport } = context;

  drawImage(
    gl,
    imageContext.program,
    imageContext.buffer,
    getOrLoadTexture(gl, imageContext.cache, node.src),
    node,
    canvasWidth,
    canvasHeight,
    viewport,
    node.flipX,
    node.flipY,
    node.rotation,
  );
};
