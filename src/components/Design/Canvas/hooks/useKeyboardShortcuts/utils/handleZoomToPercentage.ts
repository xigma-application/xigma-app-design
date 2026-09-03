// store
import { setViewport } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getRectCenter } from '../../../utils/getRectCenter';
import { getVisibleCanvasRect } from '../../../utils/getVisibleCanvasRect';
import { getZoomToViewport } from '../../../utils/getZoomToViewport';

export const handleZoomToPercentage = (dispatch: AppDispatch, refs: TCanvasRefs, percent: number): void => {
  const canvas = refs.canvasRef.current;

  if (canvas) {
    const visibleRect = getVisibleCanvasRect(
      canvas.getBoundingClientRect(),
      refs.layout.leftPanelWidthRef.current,
      refs.layout.rightPanelWidthRef.current,
    );
    const viewport = selectViewport(store.getState());

    dispatch(setViewport(getZoomToViewport(viewport, percent, getRectCenter(visibleRect))));
  }
};
