// constant
import { CHECKERBOARD_SQUARE_SIZE_PX } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';

export type TImageFillPlaceholderVertices = { squaresA: number[]; squaresB: number[] };

export const getImageFillPlaceholderVertices = (bounds: TDraftRect): TImageFillPlaceholderVertices => {
  const columns = Math.ceil(bounds.width / CHECKERBOARD_SQUARE_SIZE_PX);
  const rows = Math.ceil(bounds.height / CHECKERBOARD_SQUARE_SIZE_PX);
  const squaresA: number[] = [];
  const squaresB: number[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x1 = bounds.x + column * CHECKERBOARD_SQUARE_SIZE_PX;
      const y1 = bounds.y + row * CHECKERBOARD_SQUARE_SIZE_PX;
      const x2 = Math.min(x1 + CHECKERBOARD_SQUARE_SIZE_PX, bounds.x + bounds.width);
      const y2 = Math.min(y1 + CHECKERBOARD_SQUARE_SIZE_PX, bounds.y + bounds.height);
      const target = (row + column) % 2 === 0 ? squaresA : squaresB;

      target.push(x1, y1, x2, y1, x2, y2, x1, y1, x2, y2, x1, y2);
    }
  }

  return { squaresA, squaresB };
};
