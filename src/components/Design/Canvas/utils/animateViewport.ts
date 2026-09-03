// others
import { ZOOM_ANIMATION_DURATION_MS } from '../constants';

// store
import { setViewport } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { clamp } from 'utils/math/clamp';
import { lerp } from 'utils/math/lerp';

type TAnimationTarget = {
  anchor: TPoint;
  fromZoom: number;
  toZoom: number;
  worldFrom: TPoint;
  worldTo: TPoint;
};

const getWorldPointAtAnchor = (viewport: TViewport, anchor: TPoint): TPoint => ({
  x: (anchor.x - viewport.x) / viewport.zoom,
  y: (anchor.y - viewport.y) / viewport.zoom,
});

const tick = (dispatch: AppDispatch, target: TAnimationTarget, startTime: number): void => {
  const { anchor, fromZoom, toZoom, worldFrom, worldTo } = target;
  const progress = clamp((performance.now() - startTime) / ZOOM_ANIMATION_DURATION_MS, 0, 1);
  const eased = 1 - (1 - progress) ** 3;
  const zoom = Math.exp(lerp(Math.log(fromZoom), Math.log(toZoom), eased));

  dispatch(
    setViewport({
      x: anchor.x - lerp(worldFrom.x, worldTo.x, eased) * zoom,
      y: anchor.y - lerp(worldFrom.y, worldTo.y, eased) * zoom,
      zoom,
    }),
  );

  if (progress < 1) {
    requestAnimationFrame(() => tick(dispatch, target, startTime));
  }
};

export const animateViewport = (dispatch: AppDispatch, from: TViewport, to: TViewport, anchor: TPoint): void => {
  const target: TAnimationTarget = {
    anchor,
    fromZoom: from.zoom,
    toZoom: to.zoom,
    worldFrom: getWorldPointAtAnchor(from, anchor),
    worldTo: getWorldPointAtAnchor(to, anchor),
  };

  requestAnimationFrame(() => tick(dispatch, target, performance.now()));
};
