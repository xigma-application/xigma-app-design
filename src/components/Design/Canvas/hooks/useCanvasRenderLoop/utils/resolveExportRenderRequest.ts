// store
import { selectNodes, selectRootOrder } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './drawScene/types';
import { TImageRenderContext } from '../types';

// utils
import { getExportRenderNodes } from './drawScene/getExportRenderNodes';
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
    const { includeNodeIds, ignoreOverlappingLayers } = request;
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

    if (includeNodeIds) {
      const renderNodes = getExportRenderNodes(request.nodeId, nodesById, selectRootOrder(state), ignoreOverlappingLayers);
      const ids = renderNodes.filter((node) => includeNodeIds.has(node.id)).map((node) => node.id);

      request.onResolve(renderNodeIdsAtScale(context, request.nodeId, ids, nodesById, refs, request.scale, request.boundsOverride));
    } else if (!ignoreOverlappingLayers) {
      const renderNodes = getExportRenderNodes(request.nodeId, nodesById, selectRootOrder(state), ignoreOverlappingLayers);

      request.onResolve(renderNodeAtScale(context, request.nodeId, renderNodes, nodesById, refs, request.scale, request.boundsOverride));
    } else {
      request.onResolve(renderNodeSubtreeAtScale(context, request.nodeId, nodesById, refs, request.scale, request.boundsOverride));
    }
  }
};
