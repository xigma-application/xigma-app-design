import { RefObject } from 'react';

// others
import { AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS } from '../constants';

// types
import { TAutoLayoutReorderPreview } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

// utils
import { clamp } from 'utils/math/clamp';
import { lerp } from 'utils/math/lerp';

const tick = (
  previewRef: RefObject<TAutoLayoutReorderPreview | null>,
  frameId: string,
  activeIndex: number,
  from: Record<string, TPoint>,
  to: Record<string, TPoint>,
  startTime: number,
): void => {
  const preview = previewRef.current;

  if (preview && preview.frameId === frameId && preview.activeIndex === activeIndex) {
    const progress = clamp((performance.now() - startTime) / AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS, 0, 1);
    const eased = 1 - (1 - progress) ** 3;
    const positions = Object.keys(to).reduce<Record<string, TPoint>>((positionsById, id) => {
      const start = from[id] ?? to[id];

      positionsById[id] = { x: lerp(start.x, to[id].x, eased), y: lerp(start.y, to[id].y, eased) };

      return positionsById;
    }, {});

    previewRef.current = { ...preview, positions: { ...preview.positions, ...positions } };

    if (progress < 1) {
      requestAnimationFrame(() => tick(previewRef, frameId, activeIndex, from, to, startTime));
    }
  }
};

export const animateAutoLayoutReorder = (
  previewRef: RefObject<TAutoLayoutReorderPreview | null>,
  frameId: string,
  activeIndex: number,
  from: Record<string, TPoint>,
  to: Record<string, TPoint>,
): void => {
  previewRef.current = { activeIndex, frameId, positions: { ...previewRef.current?.positions, ...from } };

  requestAnimationFrame(() => tick(previewRef, frameId, activeIndex, from, to, performance.now()));
};
