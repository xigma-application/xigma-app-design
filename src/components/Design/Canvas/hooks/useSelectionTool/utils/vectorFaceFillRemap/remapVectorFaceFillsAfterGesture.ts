// store
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { remapFilledFaceKeys } from 'utils/canvas/vectorNetwork/remapFilledFaceKeys';

export const remapVectorFaceFillsAfterGesture = (dispatch: AppDispatch, selectionRefs: TSelectionToolRefs): void => {
  const snapshot = selectionRefs.vectorFaceFillSnapshotRef.current;

  selectionRefs.vectorFaceFillSnapshotRef.current = null;

  if (snapshot) {
    const nodes = store.getState().design.nodes;

    Object.values(snapshot).forEach((oldNode) => {
      const newNode = nodes[oldNode.id];

      if (newNode && newNode.type === NodeType.vector && newNode !== oldNode) {
        const filledFaceKeys = remapFilledFaceKeys(oldNode, newNode);

        if (
          filledFaceKeys.length !== newNode.filledFaceKeys.length ||
          filledFaceKeys.some((key) => !newNode.filledFaceKeys.includes(key))
        ) {
          dispatch(updateNode({ changes: { filledFaceKeys }, id: newNode.id }));
        }
      }
    });
  }
};
