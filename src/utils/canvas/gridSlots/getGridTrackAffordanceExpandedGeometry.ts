// constant
import {
  GRID_TRACK_AFFORDANCE_EXPANDED_CHEVRON_SIZE_PX,
  GRID_TRACK_AFFORDANCE_EXPANDED_GAP_PX,
  GRID_TRACK_AFFORDANCE_EXPANDED_GRIP_SIZE_PX,
  VALUE_LABEL_PADDING_X_PX,
  VALUE_LABEL_PADDING_Y_PX,
} from 'constant/canvas';

// types
import { TGlyphQuadBounds } from 'utils/canvas/text/getGlyphQuadBounds';
import { TPoint } from 'types/canvas';

export type TGridTrackAffordanceExpandedGeometry = {
  badgeHeight: number;
  badgeWidth: number;
  chevronCenter: TPoint;
  gripCenter: TPoint;
  textCenter: TPoint;
};

export const getGridTrackAffordanceExpandedGeometry = (
  center: TPoint,
  bounds: TGlyphQuadBounds,
  zoom: number,
): TGridTrackAffordanceExpandedGeometry => {
  const paddingX = VALUE_LABEL_PADDING_X_PX / zoom;
  const paddingY = VALUE_LABEL_PADDING_Y_PX / zoom;
  const gap = GRID_TRACK_AFFORDANCE_EXPANDED_GAP_PX / zoom;
  const gripSize = GRID_TRACK_AFFORDANCE_EXPANDED_GRIP_SIZE_PX / zoom;
  const chevronSize = GRID_TRACK_AFFORDANCE_EXPANDED_CHEVRON_SIZE_PX / zoom;
  const textWidth = bounds.maxX - bounds.minX;
  const textHeight = bounds.maxY - bounds.minY;
  const contentHeight = Math.max(textHeight, gripSize, chevronSize);
  const badgeWidth = gripSize + gap + textWidth + gap + chevronSize + 2 * paddingX;
  const badgeHeight = contentHeight + 2 * paddingY;
  const leftEdge = center.x - badgeWidth / 2;

  return {
    badgeHeight,
    badgeWidth,
    chevronCenter: { x: leftEdge + paddingX + gripSize + gap + textWidth + gap + chevronSize / 2, y: center.y },
    gripCenter: { x: leftEdge + paddingX + gripSize / 2, y: center.y },
    textCenter: { x: leftEdge + paddingX + gripSize + gap + textWidth / 2, y: center.y },
  };
};
