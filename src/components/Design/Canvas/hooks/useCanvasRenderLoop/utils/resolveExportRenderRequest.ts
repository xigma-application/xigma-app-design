// store
import { selectBackgroundPaint, selectNodes, selectRootOrder } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './drawScene/types';
import { TImageRenderContext } from '../types';

// utils
import { getExportRenderNodes } from './drawScene/getExportRenderNodes';
import { getRenderOrderedNodes } from 'store/design/utils/getRenderOrderedNodes';
import { hexToRgbaFloat } from 'utils/canvas/hexToRgbaFloat';
import { renderNodeAtScale } from './drawScene/renderExport/renderNodeAtScale';
import { renderNodeIdsAtScale } from './drawScene/renderExport/renderNodeIdsAtScale';
import { renderNodeSubtreeAtScale } from './drawScene/renderExport/renderNodeSubtreeAtScale';

export const resolveExportRenderRequest = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  refs: TCanvasRefs,
): void => {
  const request = refs.exportRenderRequestRef.current;

  if (request) {
    refs.exportRenderRequestRef.current = null;

    const state = store.getState();
    const nodesById = selectNodes(state);
    const { includeNodeIds, ignoreOverlappingLayers, nodeId } = request;
    const context: TDrawSceneContext = {
      buffer,
      canvasHeight: 0,
      canvasWidth: 0,
      gl,
      imageContext,
      imageFilterQuality: request.imageFilterQuality,
      program,
      viewport: { x: 0, y: 0, zoom: 1 },
    };

    if (nodeId === null) {
      const pageNodes = getRenderOrderedNodes(selectRootOrder(state), nodesById).filter((node) => !node.hidden);
      const ids = (includeNodeIds ? pageNodes.filter((node) => includeNodeIds.has(node.id)) : pageNodes).map((node) => node.id);
      const backgroundPaint = selectBackgroundPaint(state);
      const backgroundColor = hexToRgbaFloat(backgroundPaint.color, backgroundPaint.opacity / 100);

      request.onResolve(renderNodeIdsAtScale(context, null, ids, nodesById, refs, request.scale, request.boundsOverride, backgroundColor));
    } else if (includeNodeIds) {
      const renderNodes = getExportRenderNodes(nodeId, nodesById, selectRootOrder(state), ignoreOverlappingLayers);
      const ids = renderNodes.filter((node) => includeNodeIds.has(node.id)).map((node) => node.id);

      request.onResolve(renderNodeIdsAtScale(context, nodeId, ids, nodesById, refs, request.scale, request.boundsOverride));
    } else if (!ignoreOverlappingLayers) {
      const renderNodes = getExportRenderNodes(nodeId, nodesById, selectRootOrder(state), ignoreOverlappingLayers);
      request.onResolve(renderNodeAtScale(context, nodeId, renderNodes, nodesById, refs, request.scale, request.boundsOverride));
    } else {
      request.onResolve(renderNodeSubtreeAtScale(context, nodeId, nodesById, refs, request.scale, request.boundsOverride));
    }
  }
};
