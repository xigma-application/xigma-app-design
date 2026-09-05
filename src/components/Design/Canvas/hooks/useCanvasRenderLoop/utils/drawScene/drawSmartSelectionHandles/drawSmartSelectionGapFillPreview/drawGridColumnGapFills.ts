// types
import { TDraftRect } from 'types/canvas';
import { TGridGeometry, TSmartSelectionNode } from 'types/design/smartSelection/types';
import { TViewport } from 'types/design/types';

// utils
import { drawFillRect } from './drawFillRect';
import { getGridCellRect } from '../../../../../../utils/getSmartSelectionLayout/getGridCellRect';

export const drawGridColumnGapFills = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  cells: (TSmartSelectionNode | null)[][],
  geometry: TGridGeometry,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  cells.forEach((row, rowIndex) => {
    for (let column = 0; column < geometry.columnX.length - 1; column += 1) {
      if (row[column] !== null && row[column + 1] !== null) {
        const before = getGridCellRect(geometry, rowIndex, column);
        const after = getGridCellRect(geometry, rowIndex, column + 1);

        const rect: TDraftRect = {
          height: before.height,
          width: after.x - (before.x + before.width),
          x: before.x + before.width,
          y: before.y,
        };

        drawFillRect(gl, program, buffer, rect, canvasWidth, canvasHeight, viewport);
      }
    }
  });
};
