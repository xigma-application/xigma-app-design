// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';

// utils
import { getAxisSign } from './getAxisSign';
import { HANDLE_AXES } from '../../../../../utils/getResizeAxisAnchors';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getRotatedAnchorSolver = (
  bounds: TDraftRect,
  handle: TResizeHandle,
  rotation: number,
  scaleX: number,
  scaleY: number,
): ((width: number, height: number) => TPoint) => {
  const oldCenter: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const axes = HANDLE_AXES[handle];
  const signX = getAxisSign(axes.x);
  const signY = getAxisSign(axes.y);
  const oldOffset = rotatePoint({ x: (signX * bounds.width) / 2, y: (signY * bounds.height) / 2 }, { x: 0, y: 0 }, rotation);
  const anchorWorldPoint: TPoint = { x: oldCenter.x + oldOffset.x, y: oldCenter.y + oldOffset.y };
  // once a drag crosses the anchor, the anchor corner sits on the OPPOSITE side of the new (mirrored)
  // local box, so the sign used to locate it must flip for whichever axis actually crossed
  const crossedSignX = signX * Math.sign(scaleX);
  const crossedSignY = signY * Math.sign(scaleY);

  return (width, height) => {
    const newOffset = rotatePoint({ x: (crossedSignX * width) / 2, y: (crossedSignY * height) / 2 }, { x: 0, y: 0 }, rotation);

    return { x: anchorWorldPoint.x - newOffset.x - width / 2, y: anchorWorldPoint.y - newOffset.y - height / 2 };
  };
};
