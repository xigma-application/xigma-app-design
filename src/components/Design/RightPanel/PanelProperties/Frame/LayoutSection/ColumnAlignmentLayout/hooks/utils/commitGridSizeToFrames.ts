// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { AppDispatch } from 'store';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';

// types
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { commitGridColumnCountChange } from './commitGridColumnCountChange';
import { commitGridRepackedAnchors } from './commitGridRepackedAnchors';
import { commitGridRowCountChange } from './commitGridRowCountChange';
import { commitGridSpanReset } from './commitGridSpanReset';
import { resolveGridResize } from 'store/design/utils/autoLayout/getGridResizeRepack';

export type TGridFrameSize = { columns: number; rows: number | undefined };

export const commitGridSizeToFrames = (
  dispatch: AppDispatch,
  frames: TFrameNode[],
  nodes: Record<string, TSceneNode>,
  getSize: TFunc<[TFrameNode], TGridFrameSize>,
): void => {
  dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
  frames.forEach((frame) => {
    const { columns, rows } = getSize(frame);
    const resolution = resolveGridResize(frame, nodes, columns, rows);

    if (resolution.ok) {
      commitGridColumnCountChange(dispatch, frame, columns);

      if (rows !== undefined) {
        commitGridRowCountChange(dispatch, frame, rows);
      }

      commitGridSpanReset(dispatch, resolution.spanReset);
      commitGridRepackedAnchors(dispatch, resolution.repacked);
    }
  });
  dispatch(endHistoryGesture());
};
