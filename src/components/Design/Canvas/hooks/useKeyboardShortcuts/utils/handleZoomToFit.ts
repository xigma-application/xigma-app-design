// others
import { ZOOM_FIT_PADDING_PX } from '../../../constants';

// store
import { setViewport } from 'store/design/slice';
import { selectOrderedNodes, selectSelectedNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getFitViewport } from '../../../utils/getFitViewport';
import { getSelectionBounds } from '../../../utils/getSelectionBounds';
import { getVisibleCanvasRect } from '../../../utils/getVisibleCanvasRect';

export const handleZoomToFit = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const canvas = refs.canvasRef.current;

  if (canvas) {
    const state = store.getState();
    const selectedNodes = selectSelectedNodes(state);
    const fitNodes = selectedNodes.length > 0 ? selectedNodes : selectOrderedNodes(state);

    if (fitNodes.length > 0) {
      const visibleRect = getVisibleCanvasRect(
        canvas.getBoundingClientRect(),
        refs.layout.leftPanelWidthRef.current,
        refs.layout.rightPanelWidthRef.current,
      );
      dispatch(setViewport(getFitViewport(getSelectionBounds(fitNodes), visibleRect, ZOOM_FIT_PADDING_PX)));
    }
  }
};
