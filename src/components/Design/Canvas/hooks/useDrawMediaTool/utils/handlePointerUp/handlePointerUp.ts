import { RefObject } from 'react';

// others
import { MIN_SHAPE_SIZE } from '../../../../constants';

// store
import { addNode, setActiveTool } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TArmedMedia } from '../loadArmedMedia';
import { TDraftEntity } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { armNextFile } from '../armNextFile';
import { getAspectRatioLockedRect } from 'utils/math/getAspectRatioLockedRect';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const handlePointerUp = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  appStore: AppStore,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  armedRef: RefObject<TArmedMedia | null>,
  startRef: RefObject<TPoint | null>,
  draftRef: RefObject<TDraftEntity | null>,
  queueRef: RefObject<File[]>,
  name: string,
): void => {
  const armed = armedRef.current;

  if (armed && startRef.current) {
    const current = screenToWorld(getPointerPosition(canvas, event), selectViewport(appStore.getState()));
    const isClick = Math.abs(current.x - startRef.current.x) < MIN_SHAPE_SIZE && Math.abs(current.y - startRef.current.y) < MIN_SHAPE_SIZE;
    const rect = isClick
      ? { height: armed.naturalHeight, width: armed.naturalWidth, x: startRef.current.x, y: startRef.current.y }
      : getAspectRatioLockedRect(startRef.current, current, armed.naturalWidth / armed.naturalHeight);

    dispatch(addNode({ ...rect, flipX: false, flipY: false, name, parentId: null, rotation: 0, src: armed.src, type: NodeType.media }));

    startRef.current = null;
    draftRef.current = null;
    canvas.releasePointerCapture(event.pointerId);

    if (queueRef.current.length > 0) {
      armNextFile(canvasRef, armedRef, queueRef);
    } else {
      armedRef.current = null;
      dispatch(setActiveTool(ToolName.default));
    }
  }
};
