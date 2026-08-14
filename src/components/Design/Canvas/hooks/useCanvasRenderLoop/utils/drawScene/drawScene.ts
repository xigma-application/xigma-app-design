// store
import {
  selectEditingNodeId,
  selectEditingSelectionChangedAt,
  selectEditingSelectionEnd,
  selectEditingSelectionStart,
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
import { getPathOutlineStyles } from './getPathOutlineStyles';

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
  const editingTextBox = selectEditingTextBox(state);
  const nodesById = selectNodes(state);
  const sceneNodes = selectOrderedNodes(state).filter((node) => node.id !== editingNodeId);
  const selectedNodes = selectSelectedNodes(state).filter((node) => node.id !== editingNodeId);
  const hoveredNode = hoveredNodeId && hoveredNodeId !== editingNodeId ? nodesById[hoveredNodeId] : null;
  const selectedIds = new Set(selectSelectedNodes(state).map((node) => node.id));
  const pathOutlineStyles = getPathOutlineStyles(
    Object.values(nodesById),
    selectedIds,
    editingNodeId,
    hoveredNode?.id ?? null,
    editingTextBox?.pathId,
  );

  drawSceneBackground(gl);
  drawSceneNodes(gl, program, buffer, imageContext, sceneNodes, clientWidth, clientHeight, viewport, pathOutlineStyles);
  drawHoverOutline(gl, program, buffer, hoveredNode, clientWidth, clientHeight, viewport);
  drawSelectionOutline(gl, program, buffer, selectedNodes, clientWidth, clientHeight, viewport);
  drawFrame(gl, program, buffer, imageContext, draftShape, clientWidth, clientHeight, viewport);
  drawEditingText(
    gl,
    program,
    buffer,
    imageContext,
    editingTextBox,
    selectEditingTextContent(state),
    selectEditingSelectionStart(state),
    selectEditingSelectionEnd(state),
    selectEditingSelectionChangedAt(state),
    clientWidth,
    clientHeight,
    viewport,
  );
  drawMarquee(gl, program, buffer, marqueeRect, clientWidth, clientHeight, viewport);
};
