import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { TArmedMedia } from '../loadArmedMedia';
import { TAspectRatioLockGuide, TPoint } from 'types/canvas';

// utils
import { getAspectRatioLockedRect } from 'utils/math/getAspectRatioLockedRect';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { roundRect } from 'utils/math/roundRect';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  appStore: AppStore,
  armedRef: RefObject<TArmedMedia | null>,
  startRef: RefObject<TPoint | null>,
  nodeIdRef: RefObject<string | null>,
  aspectRatioLockGuideRef: RefObject<TAspectRatioLockGuide | null>,
): void => {
  const armed = armedRef.current;

  if (armed && startRef.current && nodeIdRef.current) {
    const current = screenToWorld(getPointerPosition(canvas, event), selectViewport(appStore.getState()));
    const rect = roundRect(getAspectRatioLockedRect(startRef.current, current, armed.naturalWidth / armed.naturalHeight));

    dispatch(updateNode({ changes: rect, id: nodeIdRef.current }));
    aspectRatioLockGuideRef.current = { ...rect, rotation: 0 };
  }
};
