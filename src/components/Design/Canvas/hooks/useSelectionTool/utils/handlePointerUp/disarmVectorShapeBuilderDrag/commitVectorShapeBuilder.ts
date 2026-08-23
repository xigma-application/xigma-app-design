// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TVectorShapeBuilderTouchedFaces } from 'types/design/canvas/types';

// utils
import { commitCrossingVectorNodeGroup } from './commitCrossingVectorNodeGroup';
import { commitSingleVectorShapeBuilderNode } from './commitSingleVectorShapeBuilderNode';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { groupCrossingVectorNodes } from 'utils/canvas/vectorNetwork/mergeVectorNodes/groupCrossingVectorNodes';

export const commitVectorShapeBuilder = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  rootOrder: string[],
  vectorEditingNodeIds: string[],
  touchedFaces: TVectorShapeBuilderTouchedFaces,
  isSubtract: boolean,
  path: TPoint[],
  isBoxMode: boolean,
): string[] => {
  const openNodes = rootOrder
    .filter((nodeId) => vectorEditingNodeIds.includes(nodeId))
    .map((nodeId) => getVectorEditingNode(nodes, nodeId))
    .filter((node): node is TVectorNode => node !== null);
  const groups = groupCrossingVectorNodes(openNodes);
  const absorbedNodeIds: string[] = [];

  groups.forEach((group) => {
    const isGroupTouched = group.nodeIds.some((nodeId) => (touchedFaces[nodeId]?.size ?? 0) > 0);

    if (isGroupTouched) {
      if (group.nodeIds.length === 1) {
        commitSingleVectorShapeBuilderNode(
          dispatch,
          getVectorEditingNode(nodes, group.nodeIds[0])!,
          touchedFaces[group.nodeIds[0]],
          isSubtract,
        );
      } else {
        absorbedNodeIds.push(...commitCrossingVectorNodeGroup(dispatch, group, path, isBoxMode, isSubtract));
      }
    }
  });

  if (absorbedNodeIds.length > 0) {
    dispatch(setVectorEditingNodeIds(vectorEditingNodeIds.filter((id) => !absorbedNodeIds.includes(id))));
  }

  return absorbedNodeIds;
};
