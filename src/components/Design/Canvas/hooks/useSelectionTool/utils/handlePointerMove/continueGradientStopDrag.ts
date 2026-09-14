import { RefObject } from 'react';

// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TGradientStopDragState } from 'types/design/canvas/types';
import { TGradientStop } from 'types/design/paint/types';

// utils
import { getGradientWorldPoints } from '../../../useCanvasRenderLoop/utils/drawScene/drawGradientHandleLayer/getGradientWorldPoints';
import { getNodeBounds } from '../../../../utils/getNodeBounds';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getPositionAlongGradientLine } from '../../../../utils/getPositionAlongGradientLine';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isLineHandleGradientPaint } from '../../../../utils/isLineHandleGradientPaint';
import { screenToWorld } from 'utils/transform/screenToWorld';

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
          const position = getPositionAlongGradientLine(worldPoint, start, end);
          const updatedStops = paint.stops.map((stop, index) => (index === resolved.index ? { ...stop, position } : stop));
          const sortedStops = [...updatedStops].sort((a, b) => a.position - b.position);
          const fills = node.fills.map((fill, index) => (index === paintIndex ? { ...paint, stops: sortedStops } : fill));
          const nextIndex = sortedStops.findIndex((stop) => stop.position === position && stop.color === color && stop.opacity === opacity);

          dragState.draggedStopIndex = nextIndex === -1 ? resolved.index : nextIndex;
          dispatch(updateNode({ changes: { fills }, id: nodeId }));
        }
      }
    }
  }
};
