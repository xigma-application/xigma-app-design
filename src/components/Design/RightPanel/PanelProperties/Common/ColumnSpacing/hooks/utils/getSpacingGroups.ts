// types
import { TSceneNode } from 'types/design/types';
import { TSpacingAxis } from '../../types';

// utils
import { getSpacingGroupSpan } from './getSpacingGroupSpan';
import { getSpacingOverlapGroups } from './getSpacingOverlapGroups';

export const getSpacingGroups = (items: TSceneNode[], axis: TSpacingAxis): TSceneNode[][] => {
  const groups = getSpacingOverlapGroups(items, axis);

  return groups.length > 1
    ? groups
    : [...items]
        .sort((nodeA, nodeB) => getSpacingGroupSpan([nodeA], axis).start - getSpacingGroupSpan([nodeB], axis).start)
        .map((node) => [node]);
};
