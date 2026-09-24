// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const expandGroupNodes = (nodes: TSceneNode[], nodesById: Record<string, TSceneNode>): TSceneNode[] =>
  nodes.flatMap((node) =>
    node.type === NodeType.group
      ? expandGroupNodes(
          node.childIds.map((childId) => nodesById[childId]).filter((child): child is TSceneNode => Boolean(child)),
          nodesById,
        )
      : [node],
  );
