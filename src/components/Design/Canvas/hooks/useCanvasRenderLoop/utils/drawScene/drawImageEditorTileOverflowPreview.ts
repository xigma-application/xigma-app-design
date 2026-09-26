// store
import { TImageEditorState } from 'store/design/types';

// types
import { TDrawSceneContext } from './types';
import { TPaint } from 'types/design/paint/types';
import { TImageRenderContext } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawImageEditorOverflowQuad } from './drawImageEditorOverflowQuad';
import { getImageTileRect } from 'components/Design/Canvas/utils/getImageTileRect';
import { getNodePaints } from 'utils/design/paint/getNodePaints';
import { getOrLoadTexture } from 'utils/canvas/getOrLoadTexture';
import { isImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/utils/isImageFrameNode';

const getImageEditorPreviewTexture = (
  gl: WebGL2RenderingContext,
  imageContext: TImageRenderContext,
  paint: TPaint | undefined,
): WebGLTexture | null | undefined =>
  paint?.type === 'image' && paint.ref
    ? getOrLoadTexture(gl, imageContext.cache, paint.ref, imageContext.imagePaintTextureSizeCache)
    : undefined;

export const drawImageEditorTileOverflowPreview = (
  context: TDrawSceneContext,
  nodesById: Record<string, TSceneNode>,
  imageEditor: TImageEditorState | null,
): void => {
  const node = imageEditor?.mode === 'tile' ? nodesById[imageEditor.nodeId] : undefined;
  const appearanceNode = node && isImageFrameNode(node) && node.rotation === 0 ? node : undefined;
  const paint = appearanceNode && imageEditor ? getNodePaints(appearanceNode, imageEditor.property)[imageEditor.paintIndex] : undefined;
  const texture = getImageEditorPreviewTexture(context.gl, context.imageContext, paint);
  const tileRect = appearanceNode && paint?.type === 'image' ? getImageTileRect(appearanceNode, paint) : undefined;

  if (paint?.type === 'image' && paint.ref && tileRect && texture) {
    drawImageEditorOverflowQuad(context, tileRect, paint, texture);
  }
};
