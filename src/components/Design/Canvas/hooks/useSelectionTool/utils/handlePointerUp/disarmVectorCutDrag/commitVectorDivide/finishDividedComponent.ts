// types
import { NodeType } from 'types/design/enums';
import { TLineNetworkCrossing, TVectorNetworkComponent } from 'utils/canvas/vectorNetwork/cutVectorNetwork/types';
import { TVectorNode } from 'types/design/types';

// utils
import { addCutClosingSegment } from 'utils/canvas/vectorNetwork/cutVectorNetwork/addCutClosingSegment/addCutClosingSegment';
import { getEffectiveVectorFillColor } from 'utils/canvas/vectorNetwork/getEffectiveVectorFillColor';
import { resolveVectorCutFilledFaceKeys } from 'utils/canvas/vectorNetwork/cutVectorNetwork/materializeVectorNetworkCut/resolveVectorCutFilledFaceKeys';

export const finishDividedComponent = (
  node: TVectorNode,
  vertexLineT: Record<string, number>,
  crossings: TLineNetworkCrossing[],
  component: TVectorNetworkComponent,
): TVectorNetworkComponent => {
  const closed = node.filledFaceKeys.length > 0 ? addCutClosingSegment(component, vertexLineT, node.filledFaceKeys, crossings) : component;
  const resultNode: TVectorNode = {
    fillColor: null,
    filledFaceKeys: [],
    id: '__divide-fill-probe',
    name: '',
    parentId: null,
    rotation: 0,
    segments: closed.segments,
    strokeColor: '#000000',
    strokeWidth: 1,
    type: NodeType.vector,
    vertexHandleModes: closed.vertexHandleModes,
    vertices: closed.vertices,
  };
  const survivingFaces = resolveVectorCutFilledFaceKeys(resultNode, node, new Set());
  const fillColorOverrideByKey = Object.fromEntries(
    survivingFaces.map(({ key, originalKey }) => [key, getEffectiveVectorFillColor(node, originalKey)]),
  );

  return {
    ...closed,
    fillColorOverrideByKey,
    filledFaceKeys: survivingFaces.map((face) => face.key),
  };
};
