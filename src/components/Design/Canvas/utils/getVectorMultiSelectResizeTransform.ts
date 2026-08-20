// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';

// utils
import { getResizeAxisAnchors } from './getResizeAxisAnchors';
import { rotatePoint } from 'utils/math/rotatePoint';

const getAxisScale = (anchorCoord: number | null, boundsStart: number, boundsSize: number, pointerCoord: number): number => {
  if (anchorCoord === null) {
    return 1;
  }

  const draggedCoord = anchorCoord === boundsStart ? boundsStart + boundsSize : boundsStart;
  return draggedCoord === anchorCoord ? 1 : (pointerCoord - anchorCoord) / (draggedCoord - anchorCoord);
};

export const getVectorMultiSelectResizeScale = (
  bounds: TDraftRect,
  handle: TResizeHandle,
  rotation: number,
  worldPoint: TPoint,
): { anchor: { x: number | null; y: number | null }; pivot: TPoint; scaleX: number; scaleY: number } => {
  const pivot: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const localPoint = rotatePoint(worldPoint, pivot, -rotation);
  const anchor = getResizeAxisAnchors(handle, bounds);

  return {
    anchor,
    pivot,
    scaleX: getAxisScale(anchor.x, bounds.x, bounds.width, localPoint.x),
    scaleY: getAxisScale(anchor.y, bounds.y, bounds.height, localPoint.y),
  };
};

const transformAxis = (start: number, size: number, anchorCoord: number | null, scale: number): { size: number; start: number } => {
  if (anchorCoord === null) {
    return { size, start };
  }

  const a = anchorCoord + (start - anchorCoord) * scale;
  const b = anchorCoord + (start + size - anchorCoord) * scale;

  return { size: Math.abs(b - a), start: Math.min(a, b) };
};

export const getScaledVectorMultiSelectBounds = (
  bounds: TDraftRect,
  anchor: { x: number | null; y: number | null },
  scaleX: number,
  scaleY: number,
): TDraftRect => {
  const x = transformAxis(bounds.x, bounds.width, anchor.x, scaleX);
  const y = transformAxis(bounds.y, bounds.height, anchor.y, scaleY);

  return { height: y.size, width: x.size, x: x.start, y: y.start };
};

const ORIGIN: TPoint = { x: 0, y: 0 };

export const getVectorMultiSelectResizeAnchorWorld = (
  bounds: TDraftRect,
  anchor: { x: number | null; y: number | null },
  rotation: number,
): TPoint => {
  const pivot: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const anchorLocal: TPoint = { x: anchor.x ?? pivot.x, y: anchor.y ?? pivot.y };

  return rotatePoint(anchorLocal, pivot, rotation);
};

export const repositionRotatedVectorMultiSelectBounds = (
  scaledBounds: TDraftRect,
  anchor: { x: number | null; y: number | null },
  anchorWorld: TPoint,
  rotation: number,
): TDraftRect => {
  if (rotation === 0) {
    return scaledBounds;
  }

  const center: TPoint = { x: scaledBounds.x + scaledBounds.width / 2, y: scaledBounds.y + scaledBounds.height / 2 };
  const anchorLocal: TPoint = { x: anchor.x ?? center.x, y: anchor.y ?? center.y };
  const offset: TPoint = { x: anchorLocal.x - center.x, y: anchorLocal.y - center.y };
  const rotatedOffset = rotatePoint(offset, ORIGIN, rotation);
  const correctCenter: TPoint = { x: anchorWorld.x - rotatedOffset.x, y: anchorWorld.y - rotatedOffset.y };

  return { ...scaledBounds, x: scaledBounds.x + (correctCenter.x - center.x), y: scaledBounds.y + (correctCenter.y - center.y) };
};
