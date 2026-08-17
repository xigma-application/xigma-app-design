// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode, TSceneNode } from 'types/design/types';

export const hasPolygonCornerRadius = (node: TSceneNode): node is TPolygonNode => node.type === NodeType.polygon;
