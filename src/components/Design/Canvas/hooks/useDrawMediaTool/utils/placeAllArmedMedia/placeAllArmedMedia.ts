// store
import { addNode, setActiveTool } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { appendLastCreatedNodeToSelection } from '../../../../utils/appendLastCreatedNodeToSelection';
import { getPlaceAllRects, TPlacedMedia } from './getPlaceAllRects';
import { getRectCenter } from '../../../../utils/getRectCenter';
import { getVisibleCanvasRect } from '../../../../utils/getVisibleCanvasRect';
import { loadAllQueuedMedia } from './loadAllQueuedMedia';
import { screenToWorld } from 'utils/transform/screenToWorld';

const addPlacedMediaNodes = (dispatch: AppDispatch, appStore: AppStore, placedMedia: TPlacedMedia[], name: string): void => {
  placedMedia.forEach(({ media, rect }) => {
    dispatch(addNode({ ...rect, flipX: false, flipY: false, name, parentId: null, rotation: 0, src: media.src, type: NodeType.media }));
    appendLastCreatedNodeToSelection(dispatch, appStore);
  });
};

export const placeAllArmedMedia = async (
  canvas: HTMLCanvasElement,
  dispatch: AppDispatch,
  appStore: AppStore,
  refs: TCanvasRefs,
  name: string,
): Promise<void> => {
  const { armedRef, queueRef } = refs.media;
  const armed = armedRef.current;
  const queue = queueRef.current;

  if (armed || queue.length > 0) {
    const mediaList = await loadAllQueuedMedia(armed, queue);
    const visibleRect = getVisibleCanvasRect(canvas.getBoundingClientRect(), refs.layout);
    const worldCenter = screenToWorld(getRectCenter(visibleRect), selectViewport(appStore.getState()));
    const placedMedia = getPlaceAllRects(mediaList, worldCenter);

    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    addPlacedMediaNodes(dispatch, appStore, placedMedia, name);
    dispatch(endHistoryGesture());
    dispatch(setActiveTool(ToolName.default));
  }
};
