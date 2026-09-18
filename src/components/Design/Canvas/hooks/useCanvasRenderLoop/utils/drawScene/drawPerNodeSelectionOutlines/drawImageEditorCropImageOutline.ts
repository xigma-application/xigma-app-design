// store
import { TImageEditorState } from 'store/design/types';

// types
import { TBoxSceneNode, TPathNode, TViewport } from 'types/design/types';

// utils
import { getNodePaints } from 'utils/design/paint/getNodePaints';
import { drawImageEditorImageOutline } from './drawImageEditorImageOutline';
import { getImageCropRect } from 'components/Design/Canvas/utils/getImageCropRect';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

export const drawImageEditorCropImageOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: Exclude<TBoxSceneNode, TPathNode>,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  imageEditor: TImageEditorState,
  isImageSelected: boolean,
): void => {
  if (imageEditor.mode === 'crop' && isAppearanceNode(node)) {
    const paint = getNodePaints(node, imageEditor.property)[imageEditor.paintIndex];

    if (paint?.type === 'image' || paint?.type === 'video') {
      const crop = getImageCropRect(node, paint);
      drawImageEditorImageOutline(gl, program, buffer, crop, canvasWidth, canvasHeight, viewport, isImageSelected);
    }
  }
};
