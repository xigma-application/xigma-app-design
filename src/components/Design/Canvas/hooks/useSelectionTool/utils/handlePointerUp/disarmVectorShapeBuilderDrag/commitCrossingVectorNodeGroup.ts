// store
import { deleteNode, updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorNodeGroup } from 'utils/canvas/vectorNetwork/mergeVectorNodes/groupCrossingVectorNodes';

// utils
import { getVectorFacesInRect } from '../../../../../utils/getVectorFacesInRect';
import { getVectorFacesOnPath } from '../../../../../utils/getVectorFacesOnPath';
import { mergeVectorFaces } from 'utils/canvas/vectorNetwork/mergeVectorFaces/mergeVectorFaces';
import { subtractVectorFaces } from 'utils/canvas/vectorNetwork/mergeVectorFaces/subtractVectorFaces';
import { toDraftRect } from '../../../../../utils/toDraftRect';

export const commitCrossingVectorNodeGroup = (
  dispatch: AppDispatch,
  group: TVectorNodeGroup,
  path: TPoint[],
  isBoxMode: boolean,
  isSubtract: boolean,
): string[] => {
  const [survivorId, ...absorbedIds] = group.nodeIds;
  const faces = isBoxMode
    ? getVectorFacesInRect(group.combinedNode, toDraftRect(path[0], path[path.length - 1]))
    : getVectorFacesOnPath(group.combinedNode, path);

  if (faces.length === 0) {
    return [];
  }

  const mutatedNode = isSubtract ? subtractVectorFaces(group.combinedNode, faces) : mergeVectorFaces(group.combinedNode, faces);

  dispatch(
    updateNode({
      changes: {
        fillByKey: mutatedNode.fillByKey,
        filledFaceKeys: mutatedNode.filledFaceKeys,
        rotation: 0,
        segments: mutatedNode.segments,
        vertices: mutatedNode.vertices,
      },
      id: survivorId,
    }),
  );
  absorbedIds.forEach((absorbedId) => dispatch(deleteNode(absorbedId)));

  return absorbedIds;
};
