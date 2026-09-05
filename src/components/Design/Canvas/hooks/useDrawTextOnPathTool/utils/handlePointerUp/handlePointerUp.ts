import { RefObject } from 'react';

// others
import { DEFAULT_SHAPE_SIZE } from '../../../../constants';

// store
import { endHistoryGesture } from 'store/history/actions';
import { setActiveTool } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TDraftEntity, TViewport } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { attachToVector } from './attachToVector';
import { drawEllipsePath } from './drawEllipsePath';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';
import { toDraftRectWithDefault } from '../../../../utils/toDraftRectWithDefault';

export const handlePointerUp = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  viewport: TViewport,
  draftRef: RefObject<TDraftEntity | null>,
  startRef: RefObject<TPoint | null>,
  attachTargetIdRef: RefObject<string | null>,
): void => {
  if (startRef.current) {
    if (attachTargetIdRef.current) {
      attachToVector(attachTargetIdRef.current, startRef.current, dispatch);
    } else {
      const rect = toDraftRectWithDefault(
        startRef.current,
        screenToWorld(getPointerPosition(canvas, event), viewport),
        DEFAULT_SHAPE_SIZE,
        true,
        viewport.zoom,
      );

      drawEllipsePath(rect, dispatch);
    }

    startRef.current = null;
    attachTargetIdRef.current = null;
    draftRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
    dispatch(setActiveTool(ToolName.default));
  }

  dispatch(endHistoryGesture());
};
