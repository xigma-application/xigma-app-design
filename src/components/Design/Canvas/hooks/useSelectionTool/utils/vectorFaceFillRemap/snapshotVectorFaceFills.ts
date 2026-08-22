// types
import { NodeType } from 'types/design/enums';
import { RootState } from 'store';
import { TSceneNode, TVectorNode } from 'types/design/types';

const isFilledVectorNode = (node: TSceneNode): node is TVectorNode => node.type === NodeType.vector && node.filledFaceKeys.length > 0;

export const snapshotVectorFaceFills = (state: RootState): Record<string, TVectorNode> =>
  Object.fromEntries(
    Object.values(state.design.nodes)
      .filter(isFilledVectorNode)
      .map((node) => [node.id, node]),
  );
