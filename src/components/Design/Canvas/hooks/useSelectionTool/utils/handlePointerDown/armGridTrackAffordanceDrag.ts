import { RefObject } from 'react';

// store
import { selectGridTrackSelection, selectNodes, selectViewport } from 'store/design/selectors';
import { setGridSettingsPanelOpen } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TPoint } from 'types/canvas';

// utils
import { getGridAxisTrackCount } from 'store/design/utils/autoLayout/gridTracks/getGridAxisTrackCount';
import { getGridTrackAffordancePillOffset } from 'utils/canvas/gridSlots/getGridTrackAffordancePillOffset';
import { publishGridTrackSelection } from 'store/design/utils/publishGridTrackSelection';
import { resolveGridTrackAffordanceDragIndices } from 'store/design/utils/autoLayout/gridTracks/resolveGridTrackAffordanceDragIndices';

const applyGridTrackSelection = (
  dispatch: AppDispatch,
  axis: TGridTrackAxis,
  frameId: string,
  sourceIndices: number[],
  currentIndices: number[],
): void => {
  if (sourceIndices !== currentIndices) {
    publishGridTrackSelection(dispatch, { axis, frameId, indices: sourceIndices });
  }

  dispatch(setGridSettingsPanelOpen(true));
};

const armGridTrackAffordanceDragState = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dragRef: RefObject<TGridTrackAffordanceDragState | null>,
  axis: TGridTrackAxis,
  frameId: string,
  frameX: number,
  frameY: number,
  point: TPoint,
  sourceIndices: number[],
  zoom: number,
): void => {
  const pillOffset = getGridTrackAffordancePillOffset(zoom);
  const ghostPosition: TPoint = axis === 'column' ? { x: point.x, y: frameY - pillOffset } : { x: frameX - pillOffset, y: point.y };

  dragRef.current = {
    axis,
    dropIndex: Math.min(...sourceIndices),
    frameId,
    ghostPosition,
    hasMoved: false,
    sourceIndices,
  };
  canvas.setPointerCapture(event.pointerId);
};

export const armGridTrackAffordanceDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dragRef: RefObject<TGridTrackAffordanceDragState | null>,
  dispatch: AppDispatch,
  frameId: string,
  axis: TGridTrackAxis,
  index: number,
  point: TPoint,
): void => {
  const state = store.getState();
  const nodesById = selectNodes(state);
  const frame = nodesById[frameId];

  if (frame && frame.type === NodeType.frame) {
    const current = selectGridTrackSelection(state);
    const currentIndices = current?.frameId === frameId && current.axis === axis ? current.indices : [];
    const trackCount = getGridAxisTrackCount(frame, nodesById, axis);
    const sourceIndices = resolveGridTrackAffordanceDragIndices(frame, nodesById, axis, trackCount, currentIndices, index);

    applyGridTrackSelection(dispatch, axis, frameId, sourceIndices, currentIndices);
    armGridTrackAffordanceDragState(
      canvas,
      event,
      dragRef,
      axis,
      frameId,
      frame.x,
      frame.y,
      point,
      sourceIndices,
      selectViewport(state).zoom,
    );
  }
};
