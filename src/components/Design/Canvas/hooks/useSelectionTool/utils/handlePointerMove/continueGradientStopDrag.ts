import { RefObject } from 'react';

// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint, TGradientStop } from 'types/design/paint/types';
import { TGradientStopDragState } from 'types/design/canvas/types';

// utils
import { getGradientWorldPoints } from '../../../useCanvasRenderLoop/utils/drawScene/drawGradientHandleLayer/getGradientWorldPoints';
import { getNodeBounds } from '../../../../utils/getNodeBounds';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getPositionAlongGradientLine } from '../../../../utils/getPositionAlongGradientLine';
import { getPositionAroundGradientEllipse } from '../../../../utils/getPositionAroundGradientEllipse';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isLineHandleGradientPaint } from '../../../../utils/isLineHandleGradientPaint';
import { rotatePoint } from 'utils/math/rotatePoint';
import { screenToWorld } from 'utils/transform/screenToWorld';
import { toNormalizedGradientPoint } from '../../../../utils/toNormalizedGradientPoint';

type TGradientStopCandidate = { index: number; stop: TGradientStop };

const findGradientStopCandidates = (stops: TGradientStop[], color: string, opacity: number): TGradientStopCandidate[] =>
  stops.map((stop, index) => ({ index, stop })).filter(({ stop }) => stop.color === color && stop.opacity === opacity);

const resolveClosestGradientStopCandidate = (
  candidates: TGradientStopCandidate[],
  referencePosition: number,
): TGradientStopCandidate | null =>
  candidates.reduce<TGradientStopCandidate | null>(
    (closest, candidate) =>
      !closest || Math.abs(candidate.stop.position - referencePosition) < Math.abs(closest.stop.position - referencePosition)
        ? candidate
        : closest,
    null,
  );

const getGradientStopDragPosition = (
  paint: TGradientPaint,
  bounds: TDraftRect,
  rotation: number,
  worldPoint: TPoint,
  start: TPoint,
  end: TPoint,
): number => {
  if (paint.type === 'gradient-angular') {
    const boundsCenter: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const localPoint = rotation === 0 ? worldPoint : rotatePoint(worldPoint, boundsCenter, -rotation);
    const normalizedPoint = toNormalizedGradientPoint(localPoint, bounds);

    return getPositionAroundGradientEllipse(normalizedPoint, paint.start, paint.end, paint.radiusRatio ?? 1);
  }

  return getPositionAlongGradientLine(worldPoint, start, end);
};

export const continueGradientStopDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  gradientStopDragRef: RefObject<TGradientStopDragState | null>,
): void => {
  const dragState = gradientStopDragRef.current;

  if (dragState) {
    const { color, draggedStopIndex, nodeId, opacity, paintIndex } = dragState;
    const state = store.getState();
    const node = selectNodes(state)[nodeId];

    if (isAppearanceNode(node)) {
      const paint = node.fills[paintIndex];

      if (isLineHandleGradientPaint(paint)) {
        const referencePosition = paint.stops[draggedStopIndex]?.position ?? 0;
        const candidates = findGradientStopCandidates(paint.stops, color, opacity);
        const resolved = resolveClosestGradientStopCandidate(candidates, referencePosition);

        if (resolved) {
          const bounds = getNodeBounds(node);
          const { end, start } = getGradientWorldPoints(bounds, node.rotation, paint);
          const worldPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
          const position = getGradientStopDragPosition(paint, bounds, node.rotation, worldPoint, start, end);
          const updatedStops = paint.stops.map((stop, index) => (index === resolved.index ? { ...stop, position } : stop));
          const sortedStops = [...updatedStops].sort((a, b) => a.position - b.position);
          const fills = node.fills.map((fill, index) => (index === paintIndex ? { ...paint, stops: sortedStops } : fill));
          const nextIndex = sortedStops.findIndex((stop) => stop.position === position && stop.color === color && stop.opacity === opacity);

          // the dragged stop was just written into updatedStops with this exact position/color/opacity, so sortedStops (the same entries, only reordered) always contains a match
          dragState.draggedStopIndex = nextIndex === -1 ? /* v8 ignore next */ resolved.index : nextIndex;
          dispatch(updateNode({ changes: { fills }, id: nodeId }));
        }
      }
    }
  }
};
