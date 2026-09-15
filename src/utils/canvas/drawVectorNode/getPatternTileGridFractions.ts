// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TPatternPaint } from 'types/design/paint/types';

export type TPatternTileGridFractions = { alignFrac: TPoint; periodFrac: TPoint; tileFrac: TPoint };

const getAxisAlignOffset = (position: number, boundsSize: number, tileSize: number): number => {
  switch (position) {
    case 0:
      return 0;
    case 1:
      return boundsSize / 2 - tileSize / 2;
    default:
      return boundsSize - tileSize;
  }
};

export const getPatternTileGridFractions = (
  bounds: TDraftRect,
  tileWorldWidth: number,
  tileWorldHeight: number,
  paint: TPatternPaint,
): TPatternTileGridFractions => {
  const safeBoundsWidth = Math.max(bounds.width, 1);
  const safeBoundsHeight = Math.max(bounds.height, 1);
  const periodWidth = tileWorldWidth * (1 + paint.spacingX / 100);
  const periodHeight = tileWorldHeight * (1 + paint.spacingY / 100);
  const col = paint.alignmentIndex % 3;
  const row = Math.floor(paint.alignmentIndex / 3);
  const alignOffsetX = getAxisAlignOffset(col, bounds.width, tileWorldWidth);
  const alignOffsetY = getAxisAlignOffset(row, bounds.height, tileWorldHeight);

  return {
    alignFrac: { x: alignOffsetX / safeBoundsWidth, y: alignOffsetY / safeBoundsHeight },
    periodFrac: { x: periodWidth / safeBoundsWidth, y: periodHeight / safeBoundsHeight },
    tileFrac: { x: tileWorldWidth / safeBoundsWidth, y: tileWorldHeight / safeBoundsHeight },
  };
};
