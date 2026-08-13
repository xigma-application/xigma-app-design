// store
import {
  selectEditingNodeId,
  selectEditingTextBox,
  selectEditingTextContent,
  selectNodes,
  selectOrderedNodes,
  selectSelectedNodes,
  selectViewport,
} from 'store/design/selectors';
import { store } from 'store';

// types
import { TDraftRect } from 'types/canvas';
import { TDraftEntity } from 'types/design/types';
import { TImageRenderContext } from '../../types';

// utils
import { drawEditingText } from './drawEditingText';
import { drawFrame } from './drawFrame';
import { drawHoverOutline } from './drawHoverOutline';
import { drawMarquee } from 'utils/canvas/drawMarquee';
import { drawSceneBackground } from 'utils/canvas/drawSceneBackground';
import { drawSceneNodes } from './drawSceneNodes';
import { drawSelectionOutline } from './drawSelectionOutline';

export const drawScene = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  canvas: HTMLCanvasElement,
  draftShape?: TDraftEntity | null,
  marqueeRect?: TDraftRect | null,
  hoveredNodeId?: string | null,
): void => {
  const state = store.getState();
  const viewport = selectViewport(state);
  const { clientHeight, clientWidth } = canvas;
  const editingNodeId = selectEditingNodeId(state);
  const sceneNodes = selectOrderedNodes(state).filter((node) => node.id !== editingNodeId);
  const selectedNodes = selectSelectedNodes(state).filter((node) => node.id !== editingNodeId);
  const hoveredNode = hoveredNodeId && hoveredNodeId !== editingNodeId ? selectNodes(state)[hoveredNodeId] : null;

  drawSceneBackground(gl);
  drawSceneNodes(gl, program, buffer, imageContext, sceneNodes, clientWidth, clientHeight, viewport);
  drawHoverOutline(gl, program, buffer, hoveredNode, clientWidth, clientHeight, viewport);
  drawSelectionOutline(gl, program, buffer, selectedNodes, clientWidth, clientHeight, viewport);
  drawFrame(gl, program, buffer, imageContext, draftShape, clientWidth, clientHeight, viewport);
  drawEditingText(
    gl,
    program,
    buffer,
    imageContext,
    selectEditingTextBox(state),
    selectEditingTextContent(state),
    clientWidth,
    clientHeight,
    viewport,
  );
  drawMarquee(gl, program, buffer, marqueeRect, clientWidth, clientHeight, viewport);
};
