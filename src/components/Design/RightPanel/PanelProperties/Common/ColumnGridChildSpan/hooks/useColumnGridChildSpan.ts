// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export type TUseColumnGridChildSpanResult = {
  columnSpan: number;
  isGridChild: boolean;
  rowSpan: number;
};

export const useColumnGridChildSpan = (): TUseColumnGridChildSpanResult => {
  const nodes = useAppSelector(selectNodes);
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = selectedNode && isBoxSceneNode(selectedNode) ? selectedNode : undefined;
  const parentNode = node?.parentId ? nodes[node.parentId] : undefined;
  const isGridChild = parentNode?.type === NodeType.frame && parentNode.layoutMode === LayoutMode.grid;

  return {
    columnSpan: node?.gridColumnSpan ?? 1,
    isGridChild,
    rowSpan: node?.gridRowSpan ?? 1,
  };
};
