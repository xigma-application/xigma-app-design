// store
import { selectNodes, selectRootOrder } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './drawScene/types';
import { TImageRenderContext } from '../types';

// utils
import { getExportRenderNodes } from './drawScene/getExportRenderNodes';
import { renderNodeAtScale } from './drawScene/renderNodeAtScale';

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
    const { includeNodeIds } = request;
    const renderNodes = getExportRenderNodes(request.nodeId, nodesById, selectRootOrder(state), request.ignoreOverlappingLayers);
    const nodesToDraw = includeNodeIds ? renderNodes.filter((node) => includeNodeIds.has(node.id)) : renderNodes;
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

    request.onResolve(renderNodeAtScale(context, request.nodeId, nodesToDraw, nodesById, refs, request.scale, request.boundsOverride));
  }
};
