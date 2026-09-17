// others
import { IMAGE_EDITOR_CROP_OVERFLOW_ALPHA } from 'constant/canvas';

// types
import { TDrawSceneContext } from './types';
import { TImageFillCoverUv } from 'utils/canvas/drawVectorNode/getImageFillCoverUv';
import { TImageCrop, TImagePaint } from 'types/design/paint/types';

// utils
import { getFlippedImageFillUv } from 'utils/canvas/drawVectorNode/getFlippedImageFillUv';
import { getImageFillQuadVertices } from 'utils/canvas/drawVectorNode/getImageFillQuadVertices';

const FULL_IMAGE_UV: TImageFillCoverUv = { uMax: 1, uMin: 0, vMax: 1, vMin: 0 };

const getImageEditorPreviewQuadVertices = (rect: TImageCrop, paintRotation: number, flipX: boolean, flipY: boolean): Float32Array =>
  new Float32Array(getImageFillQuadVertices(rect, getFlippedImageFillUv(FULL_IMAGE_UV, flipX, flipY), paintRotation, rect.rotation));

export const drawImageEditorOverflowQuad = (
  context: TDrawSceneContext,
  rect: TImageCrop,
  paint: TImagePaint,
  texture: WebGLTexture,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, viewport } = context;
  const imageProgram = imageContext.program;
  const positionLocation = gl.getAttribLocation(imageProgram, 'a_position');
  const texCoordLocation = gl.getAttribLocation(imageProgram, 'a_texCoord');
  const textureLocation = gl.getUniformLocation(imageProgram, 'u_texture');
  const opacityLocation = gl.getUniformLocation(imageProgram, 'u_opacity');
  const viewportOffsetLocation = gl.getUniformLocation(imageProgram, 'u_viewportOffset');
  const zoomLocation = gl.getUniformLocation(imageProgram, 'u_zoom');
  const resolutionLocation = gl.getUniformLocation(imageProgram, 'u_resolution');
  const stride = 4 * Float32Array.BYTES_PER_ELEMENT;

  gl.useProgram(imageProgram);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(textureLocation, 0);
  gl.uniform1f(opacityLocation, IMAGE_EDITOR_CROP_OVERFLOW_ALPHA);
  gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
  gl.uniform1f(zoomLocation, viewport.zoom);
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
  gl.enableVertexAttribArray(positionLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    getImageEditorPreviewQuadVertices(rect, paint.rotation, Boolean(paint.flipX), Boolean(paint.flipY)),
    gl.STATIC_DRAW,
  );
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
};
