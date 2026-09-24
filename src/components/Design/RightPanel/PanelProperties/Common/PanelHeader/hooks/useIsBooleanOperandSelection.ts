// store
import { isBooleanOperandNode } from 'store/design/utils/nodeHierarchy/isBooleanOperandNode';
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

export const useIsBooleanOperandSelection = (): boolean => {
  const nodes = useAppSelector(selectNodes);
  const selectedNodes = useAppSelector(selectSelectedNodes);

  return selectedNodes.length > 0 && selectedNodes.every((node) => node !== undefined && isBooleanOperandNode(node, nodes));
};
