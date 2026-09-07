// store
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, store } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { getFreeformFrameTopLeftDelta } from './getFreeformFrameTopLeftDelta';
import { getTranslatedChildChanges } from './getTranslatedChildChanges';

export const applyFreeformFrameChildTranslation = (
  frameId: string,
  frameOrigin: TResizeNodeOrigin,
  childOrigins: Record<string, TResizeNodeOrigin>,
  dispatch: AppDispatch,
): void => {
  if ('width' in frameOrigin) {
    const frameNode = selectActivePage(store.getState()).nodes[frameId];

    if (frameNode && 'width' in frameNode) {
      const delta = getFreeformFrameTopLeftDelta(frameOrigin, frameNode);

      Object.entries(childOrigins).forEach(([childId, childOrigin]) => {
        dispatch(updateNode({ changes: getTranslatedChildChanges(childOrigin, delta), id: childId }));
      });
    }
  }
};
