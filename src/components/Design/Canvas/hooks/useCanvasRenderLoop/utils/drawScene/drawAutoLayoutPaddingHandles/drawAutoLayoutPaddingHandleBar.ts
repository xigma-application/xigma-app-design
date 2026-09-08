// others
import {
  AUTO_LAYOUT_PADDING_HANDLE_FILL,
  AUTO_LAYOUT_PADDING_HANDLE_FILL_INSET_PX,
  AUTO_LAYOUT_PADDING_HANDLE_LENGTH_PX,
  AUTO_LAYOUT_PADDING_HANDLE_STROKE,
  AUTO_LAYOUT_PADDING_HANDLE_WIDTH_PX,
} from 'constant/canvas';

// types
import { TAutoLayoutPaddingSide } from 'utils/canvas/autoLayoutPadding/types';
import { TDrawSceneContext } from '../types';
import { TPoint } from 'types/canvas';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

export const drawAutoLayoutPaddingHandleBar = (
  context: TDrawSceneContext,
  center: TPoint,
  side: TAutoLayoutPaddingSide,
  frameCenter: TPoint,
  frameRotation: number,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const orientation = side === 'top' || side === 'bottom' ? 'horizontal' : 'vertical';
  const length = AUTO_LAYOUT_PADDING_HANDLE_LENGTH_PX / viewport.zoom;
  const thickness = AUTO_LAYOUT_PADDING_HANDLE_WIDTH_PX / viewport.zoom;
  const width = orientation === 'vertical' ? thickness : length;
  const height = orientation === 'vertical' ? length : thickness;
  const fillInset = (2 * AUTO_LAYOUT_PADDING_HANDLE_FILL_INSET_PX) / viewport.zoom;
  const fillWidth = Math.max(0, width - fillInset);
  const fillHeight = Math.max(0, height - fillInset);

  drawRect(
    gl,
    program,
    buffer,
    { fill: AUTO_LAYOUT_PADDING_HANDLE_STROKE, height, width, x: center.x - width / 2, y: center.y - height / 2 },
    canvasWidth,
    canvasHeight,
    viewport,
    frameRotation,
    frameCenter,
  );
  drawRect(
    gl,
    program,
    buffer,
    {
      fill: AUTO_LAYOUT_PADDING_HANDLE_FILL,
      height: fillHeight,
      width: fillWidth,
      x: center.x - fillWidth / 2,
      y: center.y - fillHeight / 2,
    },
    canvasWidth,
    canvasHeight,
    viewport,
    frameRotation,
    frameCenter,
  );
};
