// store
import { TImageEditorState } from 'store/design/types';

// types
import { TDrawSceneContext } from './types';
import { TPaint } from 'types/design/paint/types';
import { TImageRenderContext } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawImageEditorOverflowQuad } from './drawImageEditorOverflowQuad';
import { getOrCreateImagePlaceholderTexture } from 'utils/canvas/drawVectorNode/drawVectorImageFill/getOrCreateImagePlaceholderTexture';
import { getOrLoadTexture } from 'utils/canvas/getOrLoadTexture';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

const getImageEditorPreviewTexture = (
  gl: WebGL2RenderingContext,
  imageContext: TImageRenderContext,
  paint: TPaint | undefined,
): WebGLTexture | null | undefined => {
  if (paint?.type === 'image') {
    return paint.ref
      ? getOrLoadTexture(gl, imageContext.cache, paint.ref, imageContext.imagePaintTextureSizeCache)
      : getOrCreateImagePlaceholderTexture(gl, imageContext.cache);
  }

  return undefined;
};

export const drawImageEditorCropOverflowPreview = (
  context: TDrawSceneContext,
  nodesById: Record<string, TSceneNode>,
  imageEditor: TImageEditorState | null,
): void => {
  const node = imageEditor?.mode === 'crop' ? nodesById[imageEditor.nodeId] : undefined;
  const appearanceNode = node && isAppearanceNode(node) ? node : undefined;
  const paint = appearanceNode && imageEditor ? appearanceNode.fills[imageEditor.paintIndex] : undefined;
  const texture = getImageEditorPreviewTexture(context.gl, context.imageContext, paint);

  if (appearanceNode && paint?.type === 'image' && paint.crop && texture) {
    drawImageEditorOverflowQuad(context, paint.crop, paint, texture);
  }
};
