// store
import { TImageEditorState } from 'store/design/types';

// types
import { TBoxSceneNode, TPathNode, TViewport } from 'types/design/types';

// utils
import { drawImageEditorFrameOutline } from './drawImageEditorFrameOutline';
import { drawImageEditorImageOutline } from './drawImageEditorImageOutline';
import { getImageCropRect } from 'components/Design/Canvas/utils/getImageCropRect';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

export const drawImageEditorSelectionOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: Exclude<TBoxSceneNode, TPathNode>,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  imageEditor: TImageEditorState,
): void => {
  const isImageSelected = imageEditor.mode === 'crop' && imageEditor.selectedTarget === 'image';

  drawImageEditorFrameOutline(gl, program, buffer, node, canvasWidth, canvasHeight, viewport, !isImageSelected);

  if (imageEditor.mode === 'crop' && isAppearanceNode(node)) {
    const paint = node.fills[imageEditor.paintIndex];

    if (paint?.type === 'image') {
      const crop = getImageCropRect(node, paint);
      drawImageEditorImageOutline(gl, program, buffer, crop, canvasWidth, canvasHeight, viewport, isImageSelected);
    }
  }
};
