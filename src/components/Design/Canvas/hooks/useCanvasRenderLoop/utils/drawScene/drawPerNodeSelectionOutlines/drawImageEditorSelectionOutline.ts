// store
import { TImageEditorState } from 'store/design/types';

// types
import { TBoxSceneNode, TPathNode, TViewport } from 'types/design/types';

// utils
import { drawImageEditorCropImageOutline } from './drawImageEditorCropImageOutline';
import { drawImageEditorFrameOutline } from './drawImageEditorFrameOutline';
import { getImageTileRect } from 'components/Design/Canvas/utils/getImageTileRect';
import { getNodePaints } from 'utils/design/paint/getNodePaints';
import { isImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/utils/isImageFrameNode';

const drawImageEditorTileOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: Exclude<TBoxSceneNode, TPathNode>,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  imageEditor: TImageEditorState,
): void => {
  drawImageEditorFrameOutline(gl, program, buffer, node, canvasWidth, canvasHeight, viewport, false);

  if (isImageFrameNode(node)) {
    const paint = getNodePaints(node, imageEditor.property)[imageEditor.paintIndex];

    if (paint?.type === 'image' || paint?.type === 'video') {
      const tileRect = getImageTileRect(node, paint);

      if (tileRect) {
        drawImageEditorFrameOutline(gl, program, buffer, tileRect, canvasWidth, canvasHeight, viewport, true);
      }
    }
  }
};

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
  if (imageEditor.mode === 'tile') {
    drawImageEditorTileOutline(gl, program, buffer, node, canvasWidth, canvasHeight, viewport, imageEditor);
  } else {
    const isImageSelected = imageEditor.mode === 'crop' && imageEditor.selectedTarget === 'image';

    drawImageEditorFrameOutline(gl, program, buffer, node, canvasWidth, canvasHeight, viewport, !isImageSelected);
    drawImageEditorCropImageOutline(gl, program, buffer, node, canvasWidth, canvasHeight, viewport, imageEditor, isImageSelected);
  }
};
