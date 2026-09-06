import { RefObject } from 'react';

// others
import { AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS } from '../constants';

// types
import { TAutoLayoutDraggedOffsetTween, TAutoLayoutReorderPreview } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

// utils
import { clamp } from 'utils/math/clamp';
import { lerp } from 'utils/math/lerp';

const easeOffsets = (from: Record<string, TPoint>, target: Record<string, TPoint>, eased: number): Record<string, TPoint> =>
  Object.keys(target).reduce<Record<string, TPoint>>((offsets, id) => {
    offsets[id] = { x: lerp(from[id].x, target[id].x, eased), y: lerp(from[id].y, target[id].y, eased) };
    return offsets;
  }, {});

const toGhostPositions = (offsets: Record<string, TPoint>, grabbedGhost: TPoint): Record<string, TPoint> =>
  Object.keys(offsets).reduce<Record<string, TPoint>>((positionsById, id) => {
    positionsById[id] = { x: grabbedGhost.x + offsets[id].x, y: grabbedGhost.y + offsets[id].y };
    return positionsById;
  }, {});

const easedProgress = (startTime: number, now: number): number => {
  const progress = clamp((now - startTime) / AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS, 0, 1);
  return 1 - (1 - progress) ** 3;
};

const sameTarget = (before: Record<string, TPoint>, next: Record<string, TPoint>): boolean =>
  Object.keys(next).every((id) => before[id].x === next[id].x && before[id].y === next[id].y);

const settle = (previewRef: RefObject<TAutoLayoutReorderPreview | null>, startTime: number): void => {
  const preview = previewRef.current;
  const tween = preview?.draggedOffsetTween;

  if (preview && tween && tween.startTime === startTime) {
    const now = performance.now();
    const offsets = easeOffsets(tween.from, tween.target, easedProgress(startTime, now));

    previewRef.current = { ...preview, positions: { ...preview.positions, ...toGhostPositions(offsets, tween.grabbedGhost) } };

    if (now - startTime < AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS) {
      requestAnimationFrame(() => settle(previewRef, startTime));
    }
  }
};

export const resolveDraggedBlockOffsets = (
  previewRef: RefObject<TAutoLayoutReorderPreview | null>,
  preview: TAutoLayoutReorderPreview,
  grabbedGhost: TPoint,
  targetOffsets: Record<string, TPoint>,
  now: number,
): { offsets: Record<string, TPoint>; tween: TAutoLayoutDraggedOffsetTween } => {
  const previous = preview.draggedOffsetTween;

  if (previous && sameTarget(previous.target, targetOffsets)) {
    return {
      offsets: easeOffsets(previous.from, previous.target, easedProgress(previous.startTime, now)),
      tween: { ...previous, grabbedGhost },
    };
  }

  const from = previous ? easeOffsets(previous.from, previous.target, easedProgress(previous.startTime, now)) : targetOffsets;

  requestAnimationFrame(() => settle(previewRef, now));

  return { offsets: { ...from }, tween: { from, grabbedGhost, startTime: now, target: targetOffsets } };
};
