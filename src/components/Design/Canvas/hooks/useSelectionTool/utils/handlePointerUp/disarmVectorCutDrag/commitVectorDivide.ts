// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TLineNetworkCrossing, TVectorNetworkComponent } from 'utils/canvas/vectorNetwork/cutVectorNetwork/types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { addCutClosingSegment } from 'utils/canvas/vectorNetwork/cutVectorNetwork/addCutClosingSegment';
import { bakeVectorNodeRotation } from '../../../../../utils/bakeVectorNodeRotation';
import { commitVectorCutComponents } from './commitVectorCutComponents';
import { dispatchAsOneGestureIfMultiNode } from '../../../../../utils/dispatchAsOneGestureIfMultiNode';
import { findLineNetworkCrossings } from 'utils/canvas/vectorNetwork/cutVectorNetwork/findLineNetworkCrossings';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { resolveSurvivingFilledFaceKeys } from 'utils/canvas/vectorNetwork/cutVectorNetwork/resolveSurvivingFilledFaceKeys';
import { severVectorNetworkAtCrossings } from 'utils/canvas/vectorNetwork/cutVectorNetwork/severVectorNetworkAtCrossings';
import { splitVectorNetworkIntoComponents } from 'utils/canvas/vectorNetwork/cutVectorNetwork/splitVectorNetworkIntoComponents';

type TVectorDivideResult = {
  components: TVectorNetworkComponent[];
  crossings: TLineNetworkCrossing[];
  node: TVectorNode;
  vertexLineT: Record<string, number>;
};

const findVectorDivideResult = (node: TVectorNode, lineStart: TPoint, lineEnd: TPoint): TVectorDivideResult | null => {
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

export const commitVectorDivide = (
  dispatch: AppDispatch,
  lineStart: TPoint,
  lineEnd: TPoint,
  vectorEditingNodeIds: string[],
  canvasRefs: TCanvasRefs,
): void => {
  const state = store.getState();
  const results = vectorEditingNodeIds
    .map((nodeId) => getVectorEditingNode(state.design.nodes, nodeId))
    .filter((node): node is TVectorNode => node !== null)
    .map((node) => findVectorDivideResult(node, lineStart, lineEnd))
    .filter((result): result is TVectorDivideResult => result !== null);

  if (results.length > 0) {
    const totalOutputNodeCount = results.reduce((sum, result) => sum + result.components.length, 0);

    dispatchAsOneGestureIfMultiNode(dispatch, totalOutputNodeCount, () => {
      const newNodeIds = results.flatMap(({ components, crossings, node, vertexLineT }) => {
        const finish = (component: TVectorNetworkComponent): TVectorNetworkComponent => {
          const closed =
            node.filledFaceKeys.length > 0 ? addCutClosingSegment(component, vertexLineT, node.filledFaceKeys, crossings) : component;
          const survivingKeys = resolveSurvivingFilledFaceKeys(node.filledFaceKeys, closed);

          return { ...closed, filledFaceKeys: [...new Set([...survivingKeys, ...(closed.filledFaceKeys ?? [])])] };
        };

        return commitVectorCutComponents(dispatch, node, components, finish);
      });
      const touchedNodeIds = new Set(results.map((result) => result.node.id));
      const untouchedNodeIds = vectorEditingNodeIds.filter((id) => !touchedNodeIds.has(id));

      dispatch(setVectorEditingNodeIds([...untouchedNodeIds, ...touchedNodeIds, ...newNodeIds]));
    });

    canvasRefs.selectedVectorVertexIdsRef.current = [];
    canvasRefs.selectedVectorHandlesRef.current = [];
    canvasRefs.selectedVectorSegmentIdsRef.current = [];
  }
};
