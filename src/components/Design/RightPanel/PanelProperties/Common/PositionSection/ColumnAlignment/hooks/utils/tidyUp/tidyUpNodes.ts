// store
import { AppDispatch } from 'store';

// types
import { TSceneNode } from 'types/design/types';

// utils
import { getTidyUpRect } from './getTidyUpRect';
import { getTidyUpTargets } from './getTidyUpTargets';
import { translateNodeSubtree } from '../translateNodeSubtree';

export const tidyUpNodes = (dispatch: AppDispatch, nodes: Record<string, TSceneNode>, items: TSceneNode[]): void => {
  const rects = items.map(getTidyUpRect);
  const targets = getTidyUpTargets(rects);

  items.forEach((node, index) =>
    translateNodeSubtree(dispatch, nodes, node, targets[index].x - rects[index].x, targets[index].y - rects[index].y),
  );
};
