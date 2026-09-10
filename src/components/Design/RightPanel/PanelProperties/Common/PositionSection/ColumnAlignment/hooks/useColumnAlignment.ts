// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';
import { TNodeAlignment } from 'types/design/types';

// utils
import { getAlignedChildLocalPosition } from 'store/design/utils/getAlignedChildLocalPosition';
import { getNodeAbsoluteFromParentPosition } from 'store/design/utils/getNodeAbsoluteFromParentPosition';
import { getNodePositionInParent } from 'store/design/utils/getNodePositionInParent';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export type TUseColumnAlignmentResult = {
  disabled: boolean;
  horizontal: AlignmentHorizontal | undefined;
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

  const setConstraint = (next: TNodeAlignment): void => {
    if (node) {
      const cleaned = next.horizontal === undefined && next.vertical === undefined ? undefined : next;

      dispatch(updateNode({ changes: { alignment: cleaned }, id: node.id }));
    }
  };

  const moveToAlignment = (next: TNodeAlignment): void => {
    if (node && parent) {
      const currentLocal = getNodePositionInParent(node, parent);
      const targetLocal = getAlignedChildLocalPosition(next, parent, node, currentLocal);
      const targetAbsolute = getNodeAbsoluteFromParentPosition(targetLocal, parent);

      dispatch(
        updateNode({
          changes: { alignment: next, x: Math.round(targetAbsolute.x), y: Math.round(targetAbsolute.y) },
          id: node.id,
        }),
      );
    } else {
      setConstraint(next);
    }
  };

  return {
    disabled: !node?.parentId,
    horizontal: alignment?.horizontal,
    onSelectHorizontal: (value) => moveToAlignment({ horizontal: value, vertical: alignment?.vertical }),
    onSelectVertical: (value) => moveToAlignment({ horizontal: alignment?.horizontal, vertical: value }),
    setHorizontal: (value) => setConstraint({ horizontal: value, vertical: alignment?.vertical }),
    setVertical: (value) => setConstraint({ horizontal: alignment?.horizontal, vertical: value }),
    vertical: alignment?.vertical,
  };
};
