// types
import { TSceneNode } from 'types/design/types';

export const getNodeCornerRadius = (node: TSceneNode): number => ('cornerRadius' in node ? (node.cornerRadius ?? 0) : 0);
