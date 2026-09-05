// others
import { ZOOM_FIT_PADDING_PX } from '../../../constants';
import { ZOOM_HINT_FIT_LABEL_KEY } from 'components/Design/Toolbar/DesignHint/constants';

// store
import { setDesignHintLabelKey } from 'store/design/slice';
import { selectOrderedNodes, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { animateViewport } from '../../../utils/animateViewport';
import { getFitViewport } from '../../../utils/getFitViewport';
import { getRectCenter } from '../../../utils/getRectCenter';
import { getSelectionBounds } from '../../../utils/getSelectionBounds';
import { getVisibleCanvasRect } from '../../../utils/getVisibleCanvasRect';

export const handleZoomToFit = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const canvas = refs.canvasRef.current;

  if (canvas) {
    const fitNodes = selectOrderedNodes(store.getState());

    if (fitNodes.length > 0) {
      const visibleRect = getVisibleCanvasRect(canvas.getBoundingClientRect(), refs.layout);

      animateViewport(
        dispatch,
        selectViewport(store.getState()),
        getFitViewport(getSelectionBounds(fitNodes), visibleRect, ZOOM_FIT_PADDING_PX),
        getRectCenter(visibleRect),
      );
      dispatch(setDesignHintLabelKey(ZOOM_HINT_FIT_LABEL_KEY));
    }
  }
};
