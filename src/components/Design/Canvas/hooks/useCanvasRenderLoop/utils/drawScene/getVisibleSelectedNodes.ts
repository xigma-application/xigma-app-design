// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { isNodeTransforming } from './isNodeTransforming';

export const getVisibleSelectedNodes = (allSelectedNodes: TSceneNode[], editingNodeId: string | null, refs: TCanvasRefs): TSceneNode[] =>
  allSelectedNodes.filter((node) => node.id !== editingNodeId && !isNodeTransforming(refs, node.id));
