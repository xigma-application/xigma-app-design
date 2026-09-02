// others
import { SMART_SELECTION_SWAP_HANDLE_FILL, SMART_SELECTION_SWAP_HANDLE_RADIUS_PX } from 'constant/canvas';

// types
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';
import { TViewport } from 'types/design/types';

// utils
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';

const getSmartSelectionNodes = (layout: TSmartSelectionLayout): { bounds: { height: number; width: number; x: number; y: number } }[] =>
  layout.type === 'grid' ? layout.cells.flat() : layout.nodes;

export const drawSmartSelectionSwapHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  layout: TSmartSelectionLayout,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const radius = SMART_SELECTION_SWAP_HANDLE_RADIUS_PX / viewport.zoom;

  getSmartSelectionNodes(layout).forEach(({ bounds }) => {
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    drawEllipse(
      gl,
      program,
      buffer,
      { fill: SMART_SELECTION_SWAP_HANDLE_FILL, height: radius * 2, width: radius * 2, x: centerX - radius, y: centerY - radius },
      canvasWidth,
      canvasHeight,
      viewport,
      0,
    );
  });
};
