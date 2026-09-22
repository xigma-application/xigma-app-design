// store
import { selectBackgroundPaint, selectNodes, selectRootOrder } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './drawScene/types';
import { TImageRenderContext } from '../types';

// utils
import { createImageDataUrlFromPixels } from 'utils/canvas/createImageDataUrlFromPixels';
import { hexToRgbaFloat } from 'utils/canvas/hexToRgbaFloat';
import { renderPatternSourceThumbnail } from './drawScene/renderPatternSourceThumbnail';

export const resolvePatternThumbnailRequest = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  refs: TCanvasRefs,
): void => {
  const request = refs.patternThumbnailRequestRef.current;

  if (request) {
    refs.patternThumbnailRequestRef.current = null;

    const state = store.getState();
    const nodesById = selectNodes(state);
    const context: TDrawSceneContext = {
      buffer,
      canvasHeight: request.size,
      canvasWidth: request.size,
      gl,
      imageContext,
      program,
      viewport: { x: 0, y: 0, zoom: 1 },
    };
    const backgroundPaint = selectBackgroundPaint(state);
    const backgroundColor = hexToRgbaFloat(backgroundPaint.color, backgroundPaint.opacity / 100);
    const thumbnail = renderPatternSourceThumbnail(
      context,
      request.sourceNodeId,
      nodesById,
      refs,
      request.size,
      selectRootOrder(state),
      backgroundColor,
    );

    request.onResolve(thumbnail ? createImageDataUrlFromPixels(thumbnail.pixels, thumbnail.width, thumbnail.height) : null);
  }
};
