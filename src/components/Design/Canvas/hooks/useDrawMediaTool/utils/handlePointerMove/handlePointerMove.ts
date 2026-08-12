import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { AppStore } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TArmedMedia } from '../loadArmedMedia';
import { TDraftEntity } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getAspectRatioLockedRect } from 'utils/math/getAspectRatioLockedRect';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  appStore: AppStore,
  armedRef: RefObject<TArmedMedia | null>,
  startRef: RefObject<TPoint | null>,
  draftRef: RefObject<TDraftEntity | null>,
): void => {
  const armed = armedRef.current;

  if (armed && startRef.current) {
    const current = screenToWorld(getPointerPosition(canvas, event), selectViewport(appStore.getState()));
    const rect = getAspectRatioLockedRect(startRef.current, current, armed.naturalWidth / armed.naturalHeight);

    draftRef.current = { ...rect, src: armed.src, type: NodeType.media };
  }
};
