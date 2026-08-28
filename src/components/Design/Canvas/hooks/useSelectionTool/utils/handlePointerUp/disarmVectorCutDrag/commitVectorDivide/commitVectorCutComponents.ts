// store
import { addNode, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNetworkComponent } from 'utils/canvas/vectorNetwork/cutVectorNetwork/types';
import { TVectorNode } from 'types/design/types';

export const commitVectorCutComponents = (
  dispatch: AppDispatch,
  originalNode: TVectorNode,
  components: TVectorNetworkComponent[],
  finish: (component: TVectorNetworkComponent) => TVectorNetworkComponent,
): string[] => {
  if (components.length >= 2) {
    const [primary, ...rest] = [...components].sort((a, b) => Object.keys(b.vertices).length - Object.keys(a.vertices).length);
    const finishedPrimary = finish(primary);

    dispatch(
      updateNode({
        changes: {
          fillColorOverrideByKey: finishedPrimary.fillColorOverrideByKey ?? {},
          filledFaceKeys: finishedPrimary.filledFaceKeys ?? [],
          rotation: 0,
          segments: finishedPrimary.segments,
          vertexHandleModes: finishedPrimary.vertexHandleModes,
          vertices: finishedPrimary.vertices,
        },
        id: originalNode.id,
      }),
    );

    return rest.map((component) => {
      const finished = finish(component);

      dispatch(
        addNode({
          fillColor: originalNode.fillColor,
          fillColorOverrideByKey: finished.fillColorOverrideByKey ?? {},
          filledFaceKeys: finished.filledFaceKeys ?? [],
          name: originalNode.name,
          parentId: originalNode.parentId,
          rotation: 0,
          segments: finished.segments,
          strokeColor: originalNode.strokeColor,
          strokeWidth: originalNode.strokeWidth,
          type: NodeType.vector,
          vertexHandleModes: finished.vertexHandleModes,
          vertices: finished.vertices,
        }),
      );

      const { rootOrder } = selectActivePage(store.getState());
      return rootOrder[rootOrder.length - 1];
    });
  }

  return [];
};
