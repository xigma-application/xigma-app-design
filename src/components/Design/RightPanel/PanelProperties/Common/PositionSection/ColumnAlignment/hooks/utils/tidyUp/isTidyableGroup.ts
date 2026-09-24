// others
import { TIDY_UP_MAX_LAYERS, TIDY_UP_MIN_LAYERS, TIDY_UP_POSITION_EPSILON } from '../../../constants';

// types
import { TSceneNode } from 'types/design/types';

// utils
import { getTidyUpRect } from './getTidyUpRect';
import { getTidyUpTargets } from './getTidyUpTargets';

export const isTidyableGroup = (group: TSceneNode[]): boolean => {
  const rects = group.map(getTidyUpRect);
  const hasLayerCount = group.length >= TIDY_UP_MIN_LAYERS && group.length <= TIDY_UP_MAX_LAYERS;

  return (
    hasLayerCount &&
    getTidyUpTargets(rects).some(
      (target, index) =>
        Math.abs(target.x - rects[index].x) > TIDY_UP_POSITION_EPSILON || Math.abs(target.y - rects[index].y) > TIDY_UP_POSITION_EPSILON,
    )
  );
};
