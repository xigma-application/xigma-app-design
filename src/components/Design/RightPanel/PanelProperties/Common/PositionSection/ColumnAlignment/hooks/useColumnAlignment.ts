// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { AlignmentHorizontal, AlignmentVertical, LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { alignFrameChildren } from './utils/alignFrameChildren';
import { alignSelectionGroups } from './utils/alignSelectionGroups';
import { canAlignFrameChildren } from './utils/canAlignFrameChildren';
import { commitAlignmentConstraint } from './utils/commitAlignmentConstraint';
import { getAlignableSelectionGroups } from './utils/getAlignableSelectionGroups';
import { isAutoLayoutFrame } from 'utils/canvas/signals/isAutoLayoutFrame';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { isFreeFormFrameWithChildren } from './utils/isFreeFormFrameWithChildren';
import { moveNodeToAlignment } from './utils/moveNodeToAlignment';
import { setGridChildHorizontalAlign } from './utils/setGridChildHorizontalAlign';
import { setGridChildVerticalAlign } from './utils/setGridChildVerticalAlign';

export type TUseColumnAlignmentResult = {
  disabled: boolean;
  gridHorizontal: AlignmentHorizontal | undefined;
  gridVertical: AlignmentVertical | undefined;
  horizontal: AlignmentHorizontal | undefined;
  isGridChild: boolean;
  onSelectHorizontal: TFunc<[AlignmentHorizontal]>;
  onSelectVertical: TFunc<[AlignmentVertical]>;
  setHorizontal: TFunc<[AlignmentHorizontal | undefined]>;
  setVertical: TFunc<[AlignmentVertical | undefined]>;
  showDistribute: boolean;
  vertical: AlignmentVertical | undefined;
};

export const useColumnAlignment = (): TUseColumnAlignmentResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const selectedNodes = useAppSelector(selectSelectedNodes).filter((selected): selected is TSceneNode => selected !== undefined);
  const [selectedNode] = selectedNodes;
  const isMultiSelection = selectedNodes.length > 1;
  const alignableGroups = isMultiSelection ? getAlignableSelectionGroups(selectedNodes, nodes) : [];
  const node = selectedNode && isBoxSceneNode(selectedNode) ? selectedNode : undefined;
  const alignment = node?.alignment;
  const parentNode = node?.parentId ? nodes[node.parentId] : undefined;
  const parent = parentNode && 'width' in parentNode ? parentNode : undefined;
  const ignoresAutoLayout = Boolean(node?.ignoreAutoLayout);
  const isGridChild =
    !isMultiSelection && parentNode?.type === NodeType.frame && parentNode.layoutMode === LayoutMode.grid && !ignoresAutoLayout;
  const isFlexManaged = parentNode !== undefined && isAutoLayoutFrame(parentNode);
  const childrenFrame = !isMultiSelection && canAlignFrameChildren(selectedNode) ? selectedNode : undefined;
  const isLockedInParent = !node?.parentId || (isFlexManaged && !ignoresAutoLayout);

  const onSelectHorizontal = (value: AlignmentHorizontal): void => {
    switch (true) {
      case isMultiSelection:
        alignSelectionGroups(dispatch, nodes, alignableGroups, { horizontal: value });
        break;
      case childrenFrame !== undefined:
        alignFrameChildren(dispatch, nodes, childrenFrame, { horizontal: value });
        break;
      case isGridChild:
        setGridChildHorizontalAlign(dispatch, node, value);
        break;
      default:
        moveNodeToAlignment(dispatch, node, parent, { horizontal: value, vertical: alignment?.vertical });
    }
  };

  const onSelectVertical = (value: AlignmentVertical): void => {
    switch (true) {
      case isMultiSelection:
        alignSelectionGroups(dispatch, nodes, alignableGroups, { vertical: value });
        break;
      case childrenFrame !== undefined:
        alignFrameChildren(dispatch, nodes, childrenFrame, { vertical: value });
        break;
      case isGridChild:
        setGridChildVerticalAlign(dispatch, node, value);
        break;
      default:
        moveNodeToAlignment(dispatch, node, parent, { horizontal: alignment?.horizontal, vertical: value });
    }
  };

  return {
    disabled: isMultiSelection ? alignableGroups.length === 0 : childrenFrame === undefined && isLockedInParent,
    gridHorizontal: node?.gridChildHorizontalAlign,
    gridVertical: node?.gridChildVerticalAlign,
    horizontal: alignment?.horizontal,
    isGridChild,
    onSelectHorizontal,
    onSelectVertical,
    setHorizontal: (value) => commitAlignmentConstraint(dispatch, node, { horizontal: value, vertical: alignment?.vertical }),
    setVertical: (value) => commitAlignmentConstraint(dispatch, node, { horizontal: alignment?.horizontal, vertical: value }),
    showDistribute: !isMultiSelection && isFreeFormFrameWithChildren(selectedNode),
    vertical: alignment?.vertical,
  };
};
