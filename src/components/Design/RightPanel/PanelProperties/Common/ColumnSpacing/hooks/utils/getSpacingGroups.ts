// types
import { TSceneNode } from 'types/design/types';
import { TSpacingAxis } from '../../types';

// utils
import { getSpacingGroupSpan } from './getSpacingGroupSpan';

export const getSpacingGroups = (items: TSceneNode[], axis: TSpacingAxis): TSceneNode[][] => {
  const ordered = [...items].sort((nodeA, nodeB) => getSpacingGroupSpan([nodeA], axis).start - getSpacingGroupSpan([nodeB], axis).start);
  const groups = ordered.reduce<TSceneNode[][]>((result, node) => {
    const lastGroup = result[result.length - 1];

    if (lastGroup && getSpacingGroupSpan([node], axis).start < getSpacingGroupSpan(lastGroup, axis).end) {
      lastGroup.push(node);
      return result;
    }

    return [...result, [node]];
  }, []);

  return groups.length > 1 ? groups : ordered.map((node) => [node]);
};
