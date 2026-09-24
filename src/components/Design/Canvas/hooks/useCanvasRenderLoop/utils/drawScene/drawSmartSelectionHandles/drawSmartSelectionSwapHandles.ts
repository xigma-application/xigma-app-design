// types
import { TPoint } from 'types/canvas';
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';
import { TViewport } from 'types/design/types';

// utils
import { drawSwapHandleDots } from './drawSwapHandleDots/drawSwapHandleDots';
import { drawSwapHandleRing } from './drawSwapHandleRing';
import { getSmartSelectionLayoutNodes } from './getSmartSelectionLayoutNodes';
import { isSwapHandleOnScreen } from './isSwapHandleOnScreen';

export const drawSmartSelectionSwapHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  layout: TSmartSelectionLayout,
  isBoxActive: boolean,
  hoveredCenter: TPoint | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (isBoxActive) {
    getSmartSelectionLayoutNodes(layout).forEach(({ bounds }) => {
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      const isHovered = hoveredCenter !== null && hoveredCenter.x === centerX && hoveredCenter.y === centerY;

      if (isSwapHandleOnScreen(centerX, centerY, canvasWidth, canvasHeight, viewport)) {
        drawSwapHandleRing(gl, program, buffer, centerX, centerY, isHovered, canvasWidth, canvasHeight, viewport);
      }
    });
  } else {
    drawSwapHandleDots(gl, layout, canvasWidth, canvasHeight, viewport);
  }
};
