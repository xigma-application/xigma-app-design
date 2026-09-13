// types
import { BlendMode } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const getNodeBlendMode = (node: TSceneNode): BlendMode | undefined => ('blendMode' in node ? node.blendMode : undefined);
