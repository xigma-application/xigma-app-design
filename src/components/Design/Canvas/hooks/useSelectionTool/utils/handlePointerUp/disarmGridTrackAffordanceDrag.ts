import { RefObject } from 'react';

// store
import { selectNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';

// utils
import { commitGridAxisReorder } from 'store/design/utils/autoLayout/gridTracks/commitGridAxisReorder';
import { getGridAxisTrackList } from 'store/design/utils/autoLayout/gridTracks/getGridAxisTrackList';
import { publishGridTrackSelection } from 'store/design/utils/publishGridTrackSelection';

export const disarmGridTrackAffordanceDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragRef: RefObject<TGridTrackAffordanceDragState | null>,
): void => {
  const dragState = dragRef.current;

  if (dragState) {
    if (dragState.hasMoved) {
      const nodesById = selectNodes(store.getState());
      const frame = nodesById[dragState.frameId];

      if (frame && frame.type === NodeType.frame) {
        const currentTracks = getGridAxisTrackList(frame, nodesById, dragState.axis);
        const newIndices = commitGridAxisReorder(
          dispatch,
          frame,
          nodesById,
          dragState.axis,
          currentTracks,
          dragState.sourceIndices,
          dragState.dropIndex,
        );

        if (newIndices) {
          publishGridTrackSelection(dispatch, { axis: dragState.axis, frameId: dragState.frameId, indices: newIndices });
        }
      }
    }

    dragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
