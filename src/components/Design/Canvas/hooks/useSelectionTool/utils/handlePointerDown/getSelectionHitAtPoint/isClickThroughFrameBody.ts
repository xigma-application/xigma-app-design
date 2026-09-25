// types
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { isClickThroughFrame } from 'store/design/utils/nodeHierarchy/isClickThroughFrame';
import { isPointOnNodeNameLabel } from '../../../../../utils/isPointOnNodeNameLabel';

export const isClickThroughFrameBody = (node: TSceneNode, nodesById: Record<string, TSceneNode>, point: TPoint, zoom: number): boolean =>
  isClickThroughFrame(node, nodesById) && !isPointOnNodeNameLabel(point, node, zoom, nodesById);
