// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { getRemainingSegments } from './getRemainingSegments';
import { getRemainingVertices } from 'utils/canvas/vectorNetwork/getRemainingVertices';
import { getVectorFaceVertexIds } from 'utils/canvas/vectorNetwork/getVectorFaceVertexIds';
import { getVectorFullySelectedFaces } from 'utils/canvas/vectorNetwork/getVectorFullySelectedFaces';
import { subtractVectorFaces } from 'utils/canvas/vectorNetwork/mergeVectorFaces/subtractVectorFaces';

export const deleteSelectedVertices = (dispatch: AppDispatch, owningNodes: TVectorNode[], selectedVertexIds: string[]): void => {
  owningNodes.forEach((node) => {
    const fullySelectedFaces = getVectorFullySelectedFaces(node, selectedVertexIds);
    const sectorNode = fullySelectedFaces.length > 0 ? subtractVectorFaces(node, fullySelectedFaces) : node;
    const sectorVertexIds = new Set(fullySelectedFaces.flatMap(getVectorFaceVertexIds));
    const remainingSelectedVertexIds = selectedVertexIds.filter((id) => !sectorVertexIds.has(id));

    const verticesAfterDeletion = Object.fromEntries(
      Object.entries(sectorNode.vertices).filter(([id]) => !remainingSelectedVertexIds.includes(id)),
    );
    const segments = getRemainingSegments(sectorNode, remainingSelectedVertexIds);
    const vertices = getRemainingVertices(verticesAfterDeletion, segments);

    dispatch(updateNode({ changes: { filledFaceKeys: sectorNode.filledFaceKeys, segments, vertices }, id: node.id }));
  });
};
