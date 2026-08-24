// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { mergeVectorWidthPointDragPreview } from './mergeVectorWidthPointDragPreview';

export const getPreviewSceneNodes = (nodes: TSceneNode[], editingNodeId: string | null, refs: TCanvasRefs): TSceneNode[] =>
  nodes.filter((node) => node.id !== editingNodeId).map(mergeVectorWidthPointDragPreview(refs));
