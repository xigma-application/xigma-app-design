// others
import { DISTRIBUTE_MIN_CHILDREN } from '../../constants';

// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TDistributeAxis } from '../../types';

// utils
import { canAlignFrameChildren } from '../../hooks/utils/canAlignFrameChildren';
import { distributeFrameChildren } from '../../hooks/utils/distributeFrameChildren';
import { getFrameBoxChildren } from '../../hooks/utils/getFrameBoxChildren';

export type TUseDistributeMenuResult = {
  canDistribute: boolean;
  onDistribute: TFunc<[TDistributeAxis]>;
};

export const useDistributeMenu = (): TUseDistributeMenuResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const frame = canAlignFrameChildren(selectedNode) ? selectedNode : undefined;
  const canDistribute = frame !== undefined && getFrameBoxChildren(nodes, frame).length >= DISTRIBUTE_MIN_CHILDREN;

  return {
    canDistribute,
    onDistribute: (axis) => distributeFrameChildren(dispatch, nodes, frame, axis),
  };
};
