// store
import { selectBackgroundPaint } from 'store/design/selectors';
import { store } from 'store';

// types
import { TImageRenderContext } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/types';
import { TViewport } from 'types/design/types';

// utils
import { drawBackground } from './drawBackground';
import { drawCheckerboardBackground } from './drawCheckerboardBackground';
import { setAlphaWriteEnabled } from './setAlphaWriteEnabled';

export const drawSceneBackground = (
  gl: WebGL2RenderingContext,
  imageContext: TImageRenderContext,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const paint = selectBackgroundPaint(store.getState());

  setAlphaWriteEnabled(gl, imageContext, true);

  if (paint.visible === false) {
    drawCheckerboardBackground(
      gl,
      imageContext.checkerboardProgram,
      imageContext.gridBuffer,
      canvasWidth,
      canvasHeight,
      viewport,
      paint.color,
      0,
    );
  } else if (paint.opacity < 100) {
    drawCheckerboardBackground(
      gl,
      imageContext.checkerboardProgram,
      imageContext.gridBuffer,
      canvasWidth,
      canvasHeight,
      viewport,
      paint.color,
      paint.opacity / 100,
    );
  } else {
    drawBackground(gl);
  }

  setAlphaWriteEnabled(gl, imageContext, false);
};
