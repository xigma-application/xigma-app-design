// utils
import { getRulerStep } from './getRulerStep';

export type TRulerTick = {
  label: string;
  screenPos: number;
};

export const formatRulerLabel = (value: number, step: number): string => {
  const decimals = step < 1 ? 2 : 0;
  return String(Number(value.toFixed(decimals)));
};

export const getHighlightedRulerTick = (worldPosition: number, viewportOffset: number, zoom: number, origin = 0): TRulerTick => ({
  label: formatRulerLabel(worldPosition - origin, getRulerStep(zoom)),
  screenPos: worldPosition * zoom + viewportOffset,
});

export const getRulerTicks = (lengthPx: number, viewportOffset: number, zoom: number, origin = 0): TRulerTick[] => {
  const step = getRulerStep(zoom);
  const worldStart = -viewportOffset / zoom;
  const worldEnd = (lengthPx - viewportOffset) / zoom;
  const firstTick = Math.ceil((worldStart - origin) / step) * step + origin;
  const count = Math.max(0, Math.floor((worldEnd - firstTick) / step) + 1);
  const ticks: TRulerTick[] = [];

  for (let index = 0; index < count; index += 1) {
    const world = firstTick + index * step;

    ticks.push({ label: formatRulerLabel(world - origin, step), screenPos: world * zoom + viewportOffset });
  }

  return ticks;
};
