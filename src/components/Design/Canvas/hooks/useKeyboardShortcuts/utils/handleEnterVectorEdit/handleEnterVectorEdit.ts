// store
import { setSelection } from 'store/design/slice';
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';
import { selectActiveTool, selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { convertSelectionToVectors } from './convertSelectionToVectors';
import { enterVectorEditMode } from '../../../../utils/enterVectorEditMode';
import { expandSelectedContainers } from './expandSelectedContainers';
import { getAlreadyVectorNodeIds } from './getAlreadyVectorNodeIds';
import { getSelectedSceneNodes } from './getSelectedSceneNodes';
import { getTextFlattenTargets } from '../getTextFlattenTargets';
import { isConvertibleToVectorNode } from 'utils/canvas/vectorNetwork/convertShapeToVector/convertNodeToVector';

export const handleEnterVectorEdit = async (dispatch: AppDispatch, refs: TCanvasRefs): Promise<void> => {
  const state = store.getState();
  const isSelectionTool = selectActiveTool(state) === ToolName.default || selectActiveTool(state) === ToolName.move;

  if (isSelectionTool) {
    if (selectVectorEditingNodeIds(state).length === 0) {
      const selectedNodes = getSelectedSceneNodes(state);

      if (selectedNodes.some(isContainerNode)) {
        dispatch(setSelection(expandSelectedContainers(selectedNodes)));
      } else {
        const nodesById = state.design.pages[state.design.activePageId].nodes;
        const alreadyVectorIds = getAlreadyVectorNodeIds(selectedNodes, nodesById);
        const nodesToConvert = selectedNodes.filter(isConvertibleToVectorNode);
        const hasPathBoundText = selectedNodes.some((node) => node.type === NodeType.text && node.pathId);

        if (alreadyVectorIds.length > 0 || nodesToConvert.length > 0 || hasPathBoundText) {
          const textTargets = await getTextFlattenTargets();

          convertSelectionToVectors(dispatch, refs, nodesToConvert, textTargets);
          enterVectorEditMode(dispatch, [
            ...alreadyVectorIds,
            ...nodesToConvert.map((node) => node.id),
            ...textTargets.map(({ node }) => node.id),
          ]);
        }
      }
    }
  }
};
