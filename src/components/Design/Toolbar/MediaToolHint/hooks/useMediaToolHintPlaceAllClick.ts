// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// others
import { MEDIA_TOOL_SETTINGS } from 'components/Design/Canvas/toolSettings';

// store
import { useAppDispatch, useAppStore } from 'store';

// utils
import { placeAllArmedMedia } from 'components/Design/Canvas/hooks/useDrawMediaTool/utils/placeAllArmedMedia/placeAllArmedMedia';

export const useMediaToolHintPlaceAllClick = (): (() => void) => {
  const dispatch = useAppDispatch();
  const appStore = useAppStore();
  const refs = useCanvasRefsContext();

  return () => {
    const canvas = refs.canvasRef.current;

    if (canvas) {
      placeAllArmedMedia(canvas, dispatch, appStore, refs, MEDIA_TOOL_SETTINGS.name);
    }
  };
};
