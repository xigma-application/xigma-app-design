// store
import { setViewport } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getRectCenter } from '../../../utils/getRectCenter';
import { getSteppedZoomViewport } from '../../../utils/getSteppedZoomViewport';
import { getVisibleCanvasRect } from '../../../utils/getVisibleCanvasRect';

export const handleZoomOut = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const canvas = refs.canvasRef.current;

  if (canvas) {
    const visibleRect = getVisibleCanvasRect(canvas.getBoundingClientRect(), refs.layout);
    const viewport = selectViewport(store.getState());

    dispatch(setViewport(getSteppedZoomViewport(viewport, 'out', getRectCenter(visibleRect))));
  }
};
