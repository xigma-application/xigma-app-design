// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { AlignmentHorizontal, AlignmentVertical, LayoutMode, NodeType } from 'types/design/enums';

// utils
import { commitAlignmentConstraint } from './utils/commitAlignmentConstraint';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { moveNodeToAlignment } from './utils/moveNodeToAlignment';
import { setGridChildHorizontalAlign } from './utils/setGridChildHorizontalAlign';
import { setGridChildVerticalAlign } from './utils/setGridChildVerticalAlign';

export type TUseColumnAlignmentResult = {
  disabled: boolean;
  gridHorizontal: AlignmentHorizontal;
  gridVertical: AlignmentVertical;
  horizontal: AlignmentHorizontal | undefined;
  isGridChild: boolean;
  onSelectHorizontal: TFunc<[AlignmentHorizontal]>;
  onSelectVertical: TFunc<[AlignmentVertical]>;
  setHorizontal: TFunc<[AlignmentHorizontal | undefined]>;
  setVertical: TFunc<[AlignmentVertical | undefined]>;
  vertical: AlignmentVertical | undefined;
};

export const useColumnAlignment = (): TUseColumnAlignmentResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = selectedNode && isBoxSceneNode(selectedNode) ? selectedNode : undefined;
  const alignment = node?.alignment;
  const parentNode = node?.parentId ? nodes[node.parentId] : undefined;
  const parent = parentNode && 'width' in parentNode ? parentNode : undefined;
  const isGridChild = parentNode?.type === NodeType.frame && parentNode.layoutMode === LayoutMode.grid && !node?.ignoreAutoLayout;

  return {
    disabled: !node?.parentId,
    gridHorizontal: node?.gridChildHorizontalAlign ?? AlignmentHorizontal.left,
    gridVertical: node?.gridChildVerticalAlign ?? AlignmentVertical.top,
    horizontal: alignment?.horizontal,
    isGridChild,
    onSelectHorizontal: isGridChild
      ? (value): void => setGridChildHorizontalAlign(dispatch, node, value)
      : (value): void => moveNodeToAlignment(dispatch, node, parent, { horizontal: value, vertical: alignment?.vertical }),
    onSelectVertical: isGridChild
      ? (value): void => setGridChildVerticalAlign(dispatch, node, value)
      : (value): void => moveNodeToAlignment(dispatch, node, parent, { horizontal: alignment?.horizontal, vertical: value }),
    setHorizontal: (value) => commitAlignmentConstraint(dispatch, node, { horizontal: value, vertical: alignment?.vertical }),
    setVertical: (value) => commitAlignmentConstraint(dispatch, node, { horizontal: alignment?.horizontal, vertical: value }),
    vertical: alignment?.vertical,
  };
};
