// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TSceneNode } from 'types/design/types';
import { TVectorShapeBuilderTouchedFaces } from 'types/design/canvas/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { mergeVectorFaces } from 'utils/canvas/vectorNetwork/mergeVectorFaces/mergeVectorFaces';
import { persistVectorNetworkCrossings } from 'utils/canvas/vectorNetwork/planarizeVectorNetwork/persistVectorNetworkCrossings';
import { subtractVectorFaces } from 'utils/canvas/vectorNetwork/mergeVectorFaces/subtractVectorFaces';

export const commitVectorShapeBuilder = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  touchedFaces: TVectorShapeBuilderTouchedFaces,
  isSubtract: boolean,
): void => {
  Object.entries(touchedFaces).forEach(([nodeId, faceKeys]) => {
    const node = getVectorEditingNode(nodes, nodeId);

    if (node && faceKeys.size > 0) {
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
    }
  });
};
