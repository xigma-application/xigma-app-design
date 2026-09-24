// types
import { TSceneNode } from 'types/design/types';
import { TSpacingAxis } from '../../types';

// utils
import { getSpacingGroupSpan } from './getSpacingGroupSpan';

export const getSpacingCenterSpread = (items: TSceneNode[], axis: TSpacingAxis): number => {
  const centers = items.map((node) => {
    const span = getSpacingGroupSpan([node], axis);
    return (span.start + span.end) / 2;
  });

  return Math.max(...centers) - Math.min(...centers);
};
