// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { isPointOnFrameNameLabel } from '../../../../../utils/isPointOnFrameNameLabel';

export const isClickThroughFrameBody = (node: TSceneNode, point: TPoint, zoom: number): boolean =>
  node.type === NodeType.frame && node.childIds.length > 0 && !isPointOnFrameNameLabel(point, node, zoom);
