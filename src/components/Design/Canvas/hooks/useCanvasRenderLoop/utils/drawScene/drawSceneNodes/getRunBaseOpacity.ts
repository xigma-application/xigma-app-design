// types
import { TBatchShape } from 'utils/canvas/drawRectBatch/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getEffectiveOpacityFromLookup } from '../getEffectiveOpacityFromLookup';

export const getRunBaseOpacity = (run: TBatchShape[], getNode: (id: string) => TSceneNode | undefined): number => {
  const parent = run[0].parentId ? getNode(run[0].parentId) : undefined;

  return parent ? getEffectiveOpacityFromLookup(parent, getNode) : 1;
};
