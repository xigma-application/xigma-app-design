// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint, TGradientStop } from 'types/design/paint/types';
import { TDrawSceneContext } from '../types';

// utils
import { drawGradientAddStopPreview } from './drawGradientAddStopPreview';
import { drawGradientStopValueLabel } from './drawGradientStopValueLabel';
import { getGradientEllipseNormalDirection } from 'components/Design/Canvas/utils/getGradientEllipseNormalDirection';
import { getGradientEllipsePoint } from './getGradientEllipsePoint';
import { getInterpolatedGradientColor } from '../../../../../utils/getInterpolatedGradientColor';
import { getPointAlongGradientLine } from '../../../../../utils/getPointAlongGradientLine';
import { STOP_HANDLE_OFFSET_PX } from './getGradientStopHandlePositions';

const getAddStopGuidePoint = (
  bounds: TDraftRect,
  rotation: number,
  paint: TGradientPaint,
  start: TPoint,
  end: TPoint,
  hoverPosition: number,
): TPoint =>
  paint.type === 'gradient-angular'
    ? getGradientEllipsePoint(bounds, rotation, paint, hoverPosition)
    : getPointAlongGradientLine(start, end, hoverPosition);

const getOffsetPreviewPosition = (guidePoint: TPoint, direction: TPoint, offset: number): TPoint => ({
  x: guidePoint.x + direction.x * offset,
  y: guidePoint.y + direction.y * offset,
});

const getAddStopOffsetDirection = (
  bounds: TDraftRect,
  rotation: number,
  paint: TGradientPaint,
  hoverPosition: number,
  awayFromLineDirection: TPoint,
): TPoint =>
  paint.type === 'gradient-angular' ? getGradientEllipseNormalDirection(bounds, rotation, paint, hoverPosition) : awayFromLineDirection;

export const drawGradientAddStopHoverPreview = (
  context: TDrawSceneContext,
  bounds: TDraftRect,
  rotation: number,
  paint: TGradientPaint,
  start: TPoint,
  end: TPoint,
  awayFromLineDirection: TPoint,
  stops: TGradientStop[],
  activeStopIndex: number | null,
  refs: TCanvasRefs,
): void => {
  const hoverPosition = refs.hover.hoveredGradientLinePositionRef.current;

  if (activeStopIndex === null && hoverPosition !== null) {
    const guidePoint = getAddStopGuidePoint(bounds, rotation, paint, start, end, hoverPosition);
    const direction = getAddStopOffsetDirection(bounds, rotation, paint, hoverPosition, awayFromLineDirection);
    const offset = STOP_HANDLE_OFFSET_PX / context.viewport.zoom;
    const previewPosition = getOffsetPreviewPosition(guidePoint, direction, offset);
    const { color, opacity } = getInterpolatedGradientColor(stops, hoverPosition);
    const towardGuideDirection: TPoint = { x: -direction.x, y: -direction.y };

    drawGradientAddStopPreview(context, previewPosition, towardGuideDirection, color, opacity);
    drawGradientStopValueLabel(context, previewPosition, direction, hoverPosition);
  }
};
