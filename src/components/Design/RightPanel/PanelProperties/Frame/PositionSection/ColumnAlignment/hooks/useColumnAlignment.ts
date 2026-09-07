// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { AlignmentHorizontal, AlignmentVertical, NodeType } from 'types/design/enums';
import { TNodeAlignment } from 'types/design/types';

// utils
import { getAlignedChildLocalPosition } from 'store/design/utils/getAlignedChildLocalPosition';
import { getNodeAbsoluteFromParentPosition } from 'store/design/utils/getNodeAbsoluteFromParentPosition';
import { getNodePositionInParent } from 'store/design/utils/getNodePositionInParent';

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
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const alignment = frameNode?.alignment;
  const parentNode = frameNode?.parentId ? nodes[frameNode.parentId] : undefined;
  const parent = parentNode && 'width' in parentNode ? parentNode : undefined;

  const setConstraint = (next: TNodeAlignment): void => {
    if (frameNode) {
      const cleaned = next.horizontal === undefined && next.vertical === undefined ? undefined : next;

      dispatch(updateNode({ changes: { alignment: cleaned }, id: frameNode.id }));
    }
  };

  const moveToAlignment = (next: TNodeAlignment): void => {
    if (frameNode && parent) {
      const currentLocal = getNodePositionInParent(frameNode, parent);
      const targetLocal = getAlignedChildLocalPosition(next, parent, frameNode, currentLocal);
      const targetAbsolute = getNodeAbsoluteFromParentPosition(targetLocal, parent);

      dispatch(
        updateNode({
          changes: { alignment: next, x: Math.round(targetAbsolute.x), y: Math.round(targetAbsolute.y) },
          id: frameNode.id,
        }),
      );
    } else {
      setConstraint(next);
    }
  };

  return {
    disabled: !frameNode?.parentId,
    horizontal: alignment?.horizontal,
    onSelectHorizontal: (value) => moveToAlignment({ horizontal: value, vertical: alignment?.vertical }),
    onSelectVertical: (value) => moveToAlignment({ horizontal: alignment?.horizontal, vertical: value }),
    setHorizontal: (value) => setConstraint({ horizontal: value, vertical: alignment?.vertical }),
    setVertical: (value) => setConstraint({ horizontal: alignment?.horizontal, vertical: value }),
    vertical: alignment?.vertical,
  };
};
