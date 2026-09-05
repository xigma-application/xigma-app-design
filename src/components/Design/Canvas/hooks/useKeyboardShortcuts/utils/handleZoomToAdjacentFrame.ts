// others
import { ZOOM_FIT_PADDING_PX } from '../../../constants';

// store
import { setViewport } from 'store/design/slice';
import { selectTopLevelFrameNodes, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getAdjacentFrameBounds } from '../../../utils/getAdjacentFrameBounds';
import { getFitViewport } from '../../../utils/getFitViewport';
import { getRectCenter } from '../../../utils/getRectCenter';
import { getVisibleCanvasRect } from '../../../utils/getVisibleCanvasRect';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const handleZoomToAdjacentFrame = (dispatch: AppDispatch, refs: TCanvasRefs, direction: 'next' | 'previous'): void => {
  const canvas = refs.canvasRef.current;
  const frames = selectTopLevelFrameNodes(store.getState());

  if (canvas && frames.length > 0) {
    const viewport = selectViewport(store.getState());
    const visibleRect = getVisibleCanvasRect(canvas.getBoundingClientRect(), refs.layout);
    const viewportCenterWorld = screenToWorld(getRectCenter(visibleRect), viewport);
    const bounds = getAdjacentFrameBounds(frames, viewportCenterWorld, direction)!;

    dispatch(setViewport(getFitViewport(bounds, visibleRect, ZOOM_FIT_PADDING_PX)));
  }
};
