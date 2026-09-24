// types
import { TSceneNode } from 'types/design/types';

export const getNodeGlassRotation = (node: TSceneNode): number => ('rotation' in node ? node.rotation * Math.PI : 0) / 180;
