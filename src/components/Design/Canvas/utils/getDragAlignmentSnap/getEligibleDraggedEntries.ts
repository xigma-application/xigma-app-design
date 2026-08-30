// types
import { TNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { isContactGuideEligibleNode } from '../getShapeContactGuides';

export type TEligibleDraggedEntry = {
  node: TSceneNode;
  origin: { x: number; y: number };
};

const isPlainOrigin = (origin: TNodeOrigin): origin is { x: number; y: number } => 'x' in origin && 'y' in origin;

export const getEligibleDraggedEntries = (
  nodes: Record<string, TSceneNode>,
  nodeOrigins: Record<string, TNodeOrigin>,
  draggedIds: string[],
): TEligibleDraggedEntry[] =>
  draggedIds.reduce<TEligibleDraggedEntry[]>((entries, id) => {
    const node = nodes[id];
    const origin = nodeOrigins[id];

    if (node && isPlainOrigin(origin) && isContactGuideEligibleNode(node)) {
      entries.push({ node, origin });
    }

    return entries;
  }, []);
