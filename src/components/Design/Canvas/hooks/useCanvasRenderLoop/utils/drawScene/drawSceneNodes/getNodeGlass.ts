// types
import { EffectType } from 'types/design/enums';
import { TEffect, TSceneNode } from 'types/design/types';

// utils
import { getNodeEffectOfType } from './getNodeEffectOfType';

export const getNodeGlass = (node: TSceneNode): TEffect | undefined => getNodeEffectOfType(node, EffectType.glass);
