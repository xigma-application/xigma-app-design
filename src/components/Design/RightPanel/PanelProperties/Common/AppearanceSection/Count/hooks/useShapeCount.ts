import { FocusEvent } from 'react';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TCountNode, TCountNodeType } from '../types';

// utils
import { commitShapeCount } from './utils/commitShapeCount';
import { getShapeCount } from '../utils/getShapeCount';
import { handleShapeCountBlur } from './utils/handleShapeCountBlur';

export type TUseShapeCountResult = {
  displayValue: string;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onScrub: (next: number) => void;
  value: number;
};

export const useShapeCount = (type: TCountNodeType): TUseShapeCountResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectSelectedNodes).filter((node): node is TCountNode => node?.type === type);
  const value = nodes[0] ? getShapeCount(nodes[0]) : 0;
  const displayValue = nodes.some((node) => getShapeCount(node) !== value) ? MIXED_LABEL : `${value}`;

  return {
    displayValue,
    onBlur: (event): void => handleShapeCountBlur(event, dispatch, nodes, displayValue),
    onScrub: (next): void => commitShapeCount(dispatch, nodes, (node) => getShapeCount(node) + next - value),
    value,
  };
};
