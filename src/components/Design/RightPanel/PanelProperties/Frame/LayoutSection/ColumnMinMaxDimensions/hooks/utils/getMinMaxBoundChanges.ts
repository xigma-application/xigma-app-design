// types
import { TBoxSceneNode, TSceneNodeChanges } from 'types/design/types';
import { TRevealedMinMax } from 'store/design/types';

// utils
import { clampAutoLayoutSize } from 'store/design/utils/autoLayout/clampAutoLayoutSize';

const getAxisBoundChanges = (
  size: number,
  min: number | undefined,
  max: number | undefined,
  isMinBound: boolean,
  value: number,
): { max: number | undefined; min: number | undefined; size: number } => {
  if (value <= 0) {
    return isMinBound
      ? { max, min: undefined, size: clampAutoLayoutSize(size, undefined, max) }
      : { max: undefined, min, size: clampAutoLayoutSize(size, min, undefined) };
  }

  if (isMinBound) {
    const nextMax = max !== undefined && value > max ? value : max;
    return { max: nextMax, min: value, size: clampAutoLayoutSize(size, value, nextMax) };
  }

  const nextMin = min !== undefined && value < min ? value : min;
  return { max: value, min: nextMin, size: clampAutoLayoutSize(size, nextMin, value) };
};

export const getMinMaxBoundChanges = (node: TBoxSceneNode, bound: keyof TRevealedMinMax, value: number): TSceneNodeChanges => {
  const isMinBound = bound === 'minWidth' || bound === 'minHeight';

  if (bound === 'minWidth' || bound === 'maxWidth') {
    const { max, min, size } = getAxisBoundChanges(node.width, node.minWidth, node.maxWidth, isMinBound, value);
    return { maxWidth: max, minWidth: min, width: size };
  }

  const { max, min, size } = getAxisBoundChanges(node.height, node.minHeight, node.maxHeight, isMinBound, value);
  return { height: size, maxHeight: max, minHeight: min };
};
