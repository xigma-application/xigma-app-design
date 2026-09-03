// types
import { TPoint } from 'types/canvas';
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';
import { TViewport } from 'types/design/types';

// utils
import { drawSwapHandleDot } from './drawSwapHandleDot';
import { drawSwapHandleRing } from './drawSwapHandleRing';

const getSmartSelectionNodes = (layout: TSmartSelectionLayout): { bounds: { height: number; width: number; x: number; y: number } }[] =>
  layout.type === 'grid' ? layout.cells.flat() : layout.nodes;

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
  getSmartSelectionNodes(layout).forEach(({ bounds }) => {
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    if (isBoxActive) {
      const isHovered = hoveredCenter !== null && hoveredCenter.x === centerX && hoveredCenter.y === centerY;

      drawSwapHandleRing(gl, program, buffer, centerX, centerY, isHovered, canvasWidth, canvasHeight, viewport);
    } else {
      drawSwapHandleDot(gl, program, buffer, centerX, centerY, canvasWidth, canvasHeight, viewport);
    }
  });
};
