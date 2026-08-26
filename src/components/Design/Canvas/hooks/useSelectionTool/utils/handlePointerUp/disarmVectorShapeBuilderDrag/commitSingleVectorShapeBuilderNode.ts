// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { mergeVectorFaces } from 'utils/canvas/vectorNetwork/mergeVectorFaces/mergeVectorFaces';
import { persistVectorNetworkCrossings } from 'utils/canvas/vectorNetwork/planarizeVectorNetwork/persistVectorNetworkCrossings';
import { subtractVectorFaces } from 'utils/canvas/vectorNetwork/mergeVectorFaces/subtractVectorFaces';

export const commitSingleVectorShapeBuilderNode = (
  dispatch: AppDispatch,
  node: TVectorNode,
  faceKeys: Set<string>,
  isSubtract: boolean,
): void => {
  const { segments, vertices } = persistVectorNetworkCrossings(node.segments, node.vertices);
  const bakedNode = { ...node, segments, vertices };
  const faces = deriveVectorFaces(bakedNode).filter((face) => faceKeys.has(face.key));

  if (faces.length > 0) {
    const mutatedNode = isSubtract ? subtractVectorFaces(bakedNode, faces) : mergeVectorFaces(bakedNode, faces);

    dispatch(
      updateNode({
        changes: { filledFaceKeys: mutatedNode.filledFaceKeys, segments: mutatedNode.segments, vertices: mutatedNode.vertices },
        id: node.id,
      }),
    );
  }
};
