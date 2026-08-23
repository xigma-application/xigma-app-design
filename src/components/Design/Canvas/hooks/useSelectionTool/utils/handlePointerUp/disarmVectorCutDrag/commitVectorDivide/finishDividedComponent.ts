// types
import { TLineNetworkCrossing, TVectorNetworkComponent } from 'utils/canvas/vectorNetwork/cutVectorNetwork/types';
import { TVectorNode } from 'types/design/types';

// utils
import { addCutClosingSegment } from 'utils/canvas/vectorNetwork/cutVectorNetwork/addCutClosingSegment/addCutClosingSegment';
import { resolveSurvivingFilledFaceKeys } from 'utils/canvas/vectorNetwork/cutVectorNetwork/resolveSurvivingFilledFaceKeys';

export const finishDividedComponent = (
  node: TVectorNode,
  vertexLineT: Record<string, number>,
  crossings: TLineNetworkCrossing[],
  component: TVectorNetworkComponent,
): TVectorNetworkComponent => {
  const closed = node.filledFaceKeys.length > 0 ? addCutClosingSegment(component, vertexLineT, node.filledFaceKeys, crossings) : component;
  const survivingKeys = resolveSurvivingFilledFaceKeys(node.filledFaceKeys, closed);

  return { ...closed, filledFaceKeys: [...new Set([...survivingKeys, ...(closed.filledFaceKeys ?? [])])] };
};
