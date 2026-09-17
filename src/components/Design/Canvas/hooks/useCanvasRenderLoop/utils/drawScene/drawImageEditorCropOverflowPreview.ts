// others
import { IMAGE_EDITOR_CROP_OVERFLOW_ALPHA } from 'constant/canvas';

// store
import { TImageEditorState } from 'store/design/types';

// types
import { TDrawSceneContext } from './types';
import { TImageFillCoverUv } from 'utils/canvas/drawVectorNode/getImageFillCoverUv';
import { TImageCrop, TPaint } from 'types/design/paint/types';
import { TImageRenderContext } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getFlippedImageFillUv } from 'utils/canvas/drawVectorNode/getFlippedImageFillUv';
import { getImageFillQuadVertices } from 'utils/canvas/drawVectorNode/getImageFillQuadVertices';
import { getOrLoadTexture } from 'utils/canvas/getOrLoadTexture';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

const FULL_IMAGE_UV: TImageFillCoverUv = { uMax: 1, uMin: 0, vMax: 1, vMin: 0 };

const getImageEditorPreviewTexture = (
  gl: WebGL2RenderingContext,
  imageContext: TImageRenderContext,
  paint: TPaint | undefined,
): WebGLTexture | null | undefined =>
  paint?.type === 'image' && paint.ref
    ? getOrLoadTexture(gl, imageContext.cache, paint.ref, imageContext.imagePaintTextureSizeCache)
    : undefined;

const getImageEditorPreviewQuadVertices = (crop: TImageCrop, paintRotation: number, flipX: boolean, flipY: boolean): Float32Array =>
  new Float32Array(getImageFillQuadVertices(crop, getFlippedImageFillUv(FULL_IMAGE_UV, flipX, flipY), paintRotation, crop.rotation));

export const drawImageEditorCropOverflowPreview = (
  context: TDrawSceneContext,
  nodesById: Record<string, TSceneNode>,
  imageEditor: TImageEditorState | null,
): void => {
  const node = imageEditor?.mode === 'crop' ? nodesById[imageEditor.nodeId] : undefined;
  const appearanceNode = node && isAppearanceNode(node) ? node : undefined;
  const paint = appearanceNode && imageEditor ? appearanceNode.fills[imageEditor.paintIndex] : undefined;
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, viewport } = context;
  const texture = getImageEditorPreviewTexture(gl, imageContext, paint);

  if (appearanceNode && paint?.type === 'image' && paint.ref && paint.crop && texture) {
    const crop = paint.crop;
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
      getImageEditorPreviewQuadVertices(crop, paint.rotation, Boolean(paint.flipX), Boolean(paint.flipY)),
      gl.STATIC_DRAW,
    );
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
};
