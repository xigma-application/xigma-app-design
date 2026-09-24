// others
import { handleFlattenSelection } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleFlattenSelection';

// store
import { booleanNodes } from 'store/design/slice';
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { BooleanOperation, NodeType } from 'types/design/enums';

export type TBooleanOperationState = {
  onApply: (operation: BooleanOperation) => TFunc;
  onFlatten: TFunc;
  operation: BooleanOperation;
};

export const useBooleanOperation = (): TBooleanOperationState => {
  const dispatch = useAppDispatch();
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const [selectedNode] = selectedNodes;
  const operation =
    selectedNodes.length === 1 && selectedNode?.type === NodeType.boolean ? selectedNode.booleanOperation : BooleanOperation.union;

  return {
    onApply: (nextOperation) => (): void => {
      dispatch(booleanNodes(nextOperation));
    },
    onFlatten: (): void => {
      handleFlattenSelection(dispatch);
    },
    operation,
  };
};
