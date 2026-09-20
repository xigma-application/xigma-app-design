// types
import { EffectType } from 'types/design/enums';
import { TEffect, TSceneNode } from 'types/design/types';

// utils
import { getNodeEffectOfType } from './getNodeEffectOfType';

export const getNodeTexture = (node: TSceneNode): TEffect | undefined => getNodeEffectOfType(node, EffectType.texture);
