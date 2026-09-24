// types
import { TSceneNode } from 'types/design/types';
import { TSpacingAxis } from '../../types';

// utils
import { getSpacingGroups } from './getSpacingGroups';

export const getSpacingGroupIds = (items: TSceneNode[], axis: TSpacingAxis): string[][] =>
  getSpacingGroups(items, axis).map((group) => group.map((node) => node.id));
