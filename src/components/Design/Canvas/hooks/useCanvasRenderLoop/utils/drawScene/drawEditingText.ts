// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { TEXT_FILL, TEXT_FONT_FAMILY, TEXT_FONT_SIZE, TEXT_NAME } from '../../../../constants';

// types
import { NodeType } from 'types/design/enums';
import { TEditingTextBox } from 'types/canvas';
import { TImageRenderContext } from '../../types';
import { TViewport } from 'types/design/types';

// utils
import { drawEditingCaretAndSelection } from './drawEditingCaretAndSelection';
import { drawMsdfText } from 'utils/canvas/text/drawMsdfText';
import { drawRect } from 'utils/canvas/drawRect';
import { getMsdfAtlasTexture } from 'utils/canvas/text/getMsdfAtlasTexture';

export const drawEditingText = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  editingTextBox: TEditingTextBox | null,
  editingTextContent: string,
  selectionStart: number,
  selectionEnd: number,
  selectionChangedAt: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (editingTextBox) {
    drawRect(
      gl,
      program,
      buffer,
      { ...editingTextBox, stroke: DRAFT_FRAME_STROKE },
      canvasWidth,
      canvasHeight,
      viewport,
      editingTextBox.rotation,
    );
    drawMsdfText(
      gl,
      imageContext.msdfProgram,
      imageContext.msdfBuffer,
      getMsdfAtlasTexture(gl, imageContext.cache),
      MSDF_ATLAS_JSON,
      imageContext.textGeometryCache,
      {
        content: editingTextContent,
        fill: TEXT_FILL,
        flipX: editingTextBox.flipX,
        flipY: editingTextBox.flipY,
        fontFamily: TEXT_FONT_FAMILY,
        fontSize: TEXT_FONT_SIZE,
        height: editingTextBox.height,
        id: '__editing-text__',
        name: TEXT_NAME,
        parentId: null,
        rotation: editingTextBox.rotation,
        type: NodeType.text,
        width: editingTextBox.width,
        x: editingTextBox.x,
        y: editingTextBox.y,
      },
      canvasWidth,
      canvasHeight,
      viewport,
    );
    drawEditingCaretAndSelection(
      gl,
      program,
      buffer,
      editingTextBox,
      editingTextContent,
      selectionStart,
      selectionEnd,
      selectionChangedAt,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
