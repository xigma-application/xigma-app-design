// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { TEXT_FILL, TEXT_FONT_FAMILY, TEXT_FONT_SIZE, TEXT_NAME } from '../../../../constants';

// types
import { NodeType } from 'types/design/enums';
import { TEditingTextBox } from 'types/canvas';
import { TImageRenderContext } from '../../types';
import { TViewport } from 'types/design/types';

// utils
import { drawEditingCaretAndSelection } from './drawEditingCaretAndSelection/drawEditingCaretAndSelection';
import { drawEditingTextBoxOutline } from './drawEditingTextBoxOutline';
import { drawMsdfText } from 'utils/canvas/text/drawMsdfText';
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
    drawEditingTextBoxOutline(gl, program, buffer, editingTextBox, canvasWidth, canvasHeight, viewport);
    drawMsdfText(
      gl,
      imageContext.msdfProgram,
      imageContext.msdfBuffer,
      getMsdfAtlasTexture(gl, imageContext.cache),
      MSDF_ATLAS_JSON,
      imageContext.textGeometryCache,
      imageContext.ellipseArcLengthCache,
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
        pathFlip: editingTextBox.pathFlip,
        pathId: editingTextBox.pathId,
        pathStartOffset: editingTextBox.pathStartOffset,
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
