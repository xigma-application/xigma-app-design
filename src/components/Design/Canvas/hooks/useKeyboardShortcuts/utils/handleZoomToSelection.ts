// others
import { ZOOM_FIT_PADDING_PX } from '../../../constants';

// store
import { setViewport } from 'store/design/slice';
import { selectSelectedNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getFitViewport } from '../../../utils/getFitViewport';
import { getSelectionBounds } from '../../../utils/getSelectionBounds';
import { getVisibleCanvasRect } from '../../../utils/getVisibleCanvasRect';

export const handleZoomToSelection = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const canvas = refs.canvasRef.current;
  const selectedNodes = selectSelectedNodes(store.getState());

  if (canvas && selectedNodes.length > 0) {
    const visibleRect = getVisibleCanvasRect(
      canvas.getBoundingClientRect(),
      refs.layout.leftPanelWidthRef.current,
      refs.layout.rightPanelWidthRef.current,
    );

    dispatch(setViewport(getFitViewport(getSelectionBounds(selectedNodes), visibleRect, ZOOM_FIT_PADDING_PX)));
  }
};
