// types
import { TSceneNode } from 'types/design/types';
import { TSpacingAxis } from '../../types';

// utils
import { getFreeFormSpacingAxes } from './getFreeFormSpacingAxes';

export const getColumnSpacingAxes = (selectedCount: number, items: TSceneNode[]): Record<TSpacingAxis, boolean> => {
  if (items.length > 1) {
    return selectedCount > 1 ? { horizontal: true, vertical: true } : getFreeFormSpacingAxes(items);
  }

  return { horizontal: false, vertical: false };
};
