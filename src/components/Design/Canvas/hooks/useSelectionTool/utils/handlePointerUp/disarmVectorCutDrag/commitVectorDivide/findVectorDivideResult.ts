// types
import { TPoint } from 'types/canvas';
import { TVectorDivideResult } from './types';
import { TVectorNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from '../../../../../../utils/bakeVectorNodeRotation';
import { findLineNetworkCrossings } from 'utils/canvas/vectorNetwork/cutVectorNetwork/findLineNetworkCrossings';
import { severVectorNetworkAtCrossings } from 'utils/canvas/vectorNetwork/cutVectorNetwork/severVectorNetworkAtCrossings';
import { splitVectorNetworkIntoComponents } from 'utils/canvas/vectorNetwork/cutVectorNetwork/splitVectorNetworkIntoComponents';

export const findVectorDivideResult = (node: TVectorNode, lineStart: TPoint, lineEnd: TPoint): TVectorDivideResult | null => {
  const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
  const crossings = findLineNetworkCrossings(lineStart, lineEnd, bakedNode.segments, bakedNode.vertices);
  const hasCrossings = crossings.length > 0;

  if (hasCrossings) {
    const severed = severVectorNetworkAtCrossings(bakedNode.segments, bakedNode.vertices, crossings);
    const components = splitVectorNetworkIntoComponents({
      segments: severed.segments,
      vertexHandleModes: node.vertexHandleModes,
      vertices: severed.vertices,
    });

    return components.length > 1 ? { components, crossings, node, vertexLineT: severed.vertexLineT } : null;
  }

  return null;
};
