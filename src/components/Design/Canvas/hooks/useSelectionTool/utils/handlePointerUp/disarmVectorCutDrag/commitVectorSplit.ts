// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from 'components/Design/Canvas/utils/bakeVectorNodeRotation';
import { commitVectorCutComponents } from './commitVectorDivide/commitVectorCutComponents';
import { getEffectiveVectorFillColor } from 'utils/canvas/vectorNetwork/getEffectiveVectorFillColor';
import { resolveSurvivingFilledFaceKeys } from 'utils/canvas/vectorNetwork/cutVectorNetwork/resolveSurvivingFilledFaceKeys';
import { resolveVectorCutFilledFaceKeys } from 'utils/canvas/vectorNetwork/cutVectorNetwork/materializeVectorNetworkCut/resolveVectorCutFilledFaceKeys';
import { severVectorSegmentAtPoint } from 'utils/canvas/vectorNetwork/cutVectorNetwork/severVectorSegmentAtPoint';
import { splitVectorNetworkIntoComponents } from 'utils/canvas/vectorNetwork/cutVectorNetwork/splitVectorNetworkIntoComponents';

export const commitVectorSplit = (dispatch: AppDispatch, node: TVectorNode, segmentId: string, t: number): string[] => {
  const severed = severVectorSegmentAtPoint(node, segmentId, t);
  const components = splitVectorNetworkIntoComponents({
    segments: severed.segments,
    vertexHandleModes: node.vertexHandleModes,
    vertices: severed.vertices,
  });

  if (components.length >= 2) {
    const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
    const bakedSevered = severVectorSegmentAtPoint(bakedNode, segmentId, t);
    const bakedComponents = splitVectorNetworkIntoComponents({
      segments: bakedSevered.segments,
      vertexHandleModes: node.vertexHandleModes,
      vertices: bakedSevered.vertices,
    });

    const newNodeIds = commitVectorCutComponents(dispatch, node, bakedComponents, (component) => {
      const filledFaceKeys = resolveSurvivingFilledFaceKeys(node.filledFaceKeys, component);

      return {
        ...component,
        fillColorOverrideByKey: Object.fromEntries(filledFaceKeys.map((key) => [key, getEffectiveVectorFillColor(node, key)])),
        filledFaceKeys,
      };
    });

    return [node.id, ...newNodeIds];
  }

  const resultNode = { ...node, segments: severed.segments, vertices: severed.vertices };
  const survivingFaces = resolveVectorCutFilledFaceKeys(resultNode, node, new Set());
  const fillColorOverrideByKey = Object.fromEntries(
    survivingFaces.map(({ key, originalKey }) => [key, getEffectiveVectorFillColor(node, originalKey)]),
  );

  dispatch(
    updateNode({
      changes: { ...severed, fillColorOverrideByKey, filledFaceKeys: survivingFaces.map((face) => face.key) },
      id: node.id,
    }),
  );

  return [node.id];
};
