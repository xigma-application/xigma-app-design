// store
import { TAutoLayoutGapHandles } from 'store/design/utils/autoLayout/getAutoLayoutGapHandles/types';

// types
import { TPoint } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawAutoLayoutGapHandleBar } from './drawAutoLayoutGapHandleBar';

export const drawAutoLayoutGapHandleBars = (
  context: TDrawSceneContext,
  handles: TAutoLayoutGapHandles,
  frameCenter: TPoint,
  frameRotation: number,
): void => {
  handles.horizontal.forEach((fillRect) => drawAutoLayoutGapHandleBar(context, fillRect, 'vertical', frameCenter, frameRotation));
  handles.vertical.forEach((fillRect) => drawAutoLayoutGapHandleBar(context, fillRect, 'horizontal', frameCenter, frameRotation));
};
