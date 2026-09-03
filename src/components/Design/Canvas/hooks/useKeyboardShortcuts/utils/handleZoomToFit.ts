// others
import { ZOOM_FIT_PADDING_PX } from '../../../constants';
import { ZOOM_HINT_FIT_LABEL_KEY } from 'components/Design/Toolbar/DesignHint/constants';

// store
import { setDesignHintLabelKey, setViewport } from 'store/design/slice';
import { selectOrderedNodes } from 'store/design/selectors';
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
    const fitNodes = selectOrderedNodes(store.getState());

    if (fitNodes.length > 0) {
      const visibleRect = getVisibleCanvasRect(
        canvas.getBoundingClientRect(),
        refs.layout.leftPanelWidthRef.current,
        refs.layout.rightPanelWidthRef.current,
      );
      dispatch(setViewport(getFitViewport(getSelectionBounds(fitNodes), visibleRect, ZOOM_FIT_PADDING_PX)));
      dispatch(setDesignHintLabelKey(ZOOM_HINT_FIT_LABEL_KEY));
    }
  }
};
