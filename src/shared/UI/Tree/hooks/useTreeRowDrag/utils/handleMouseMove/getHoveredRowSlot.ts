// utils
import { clamp } from 'utils/math/clamp';

export type THoveredRowSlot = {
  index: number;
  offsetRatio: number;
};

export const getHoveredRowSlot = (
  pointerY: number,
  containerTop: number,
  scrollTop: number,
  rowHeight: number,
  count: number,
): THoveredRowSlot => {
  const offsetY = pointerY - containerTop + scrollTop;
  const index = clamp(Math.floor(offsetY / rowHeight), 0, Math.max(count - 1, 0));
  const offsetRatio = clamp(offsetY / rowHeight - index, 0, 1);

  return { index, offsetRatio };
};
