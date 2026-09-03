// others
import { ZOOM_FIT_PADDING_PX } from '../../../constants';
import { ZOOM_HINT_SELECTION_LABEL_KEY } from 'components/Design/Toolbar/DesignHint/constants';

// store
import { setDesignHintLabelKey } from 'store/design/slice';
import { selectSelectedNodes, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { animateViewport } from '../../../utils/animateViewport';
import { getFitViewport } from '../../../utils/getFitViewport';
import { getRectCenter } from '../../../utils/getRectCenter';
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

    animateViewport(
      dispatch,
      selectViewport(store.getState()),
      getFitViewport(getSelectionBounds(selectedNodes), visibleRect, ZOOM_FIT_PADDING_PX),
      getRectCenter(visibleRect),
    );
    dispatch(setDesignHintLabelKey(ZOOM_HINT_SELECTION_LABEL_KEY));
  }
};
