// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { isClickThroughFrame } from 'store/design/utils/nodeHierarchy/isClickThroughFrame';
import { isPointOnFrameNameLabel } from '../../../../../utils/isPointOnFrameNameLabel';

export const isClickThroughFrameBody = (node: TSceneNode, nodesById: Record<string, TSceneNode>, point: TPoint, zoom: number): boolean =>
  node.type === NodeType.frame && isClickThroughFrame(node, nodesById) && !isPointOnFrameNameLabel(point, node, zoom);
