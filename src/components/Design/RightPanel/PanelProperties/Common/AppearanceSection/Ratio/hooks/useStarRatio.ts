import { FocusEvent } from 'react';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TStarNode } from 'types/design/types';

// utils
import { commitStarRatio } from './utils/commitStarRatio';
import { getStarRatioPercentage } from './utils/getStarRatioPercentage';
import { handleStarRatioBlur } from './utils/handleStarRatioBlur';

export type TUseStarRatioResult = {
  displayValue: string;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onScrub: (next: number) => void;
  value: number;
};

export const useStarRatio = (): TUseStarRatioResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectSelectedNodes).filter((node): node is TStarNode => node?.type === NodeType.star);
  const value = nodes[0] ? getStarRatioPercentage(nodes[0]) : 0;
  const displayValue = nodes.some((node) => getStarRatioPercentage(node) !== value) ? MIXED_LABEL : `${value}%`;

  return {
    displayValue,
    onBlur: (event): void => handleStarRatioBlur(event, dispatch, nodes, displayValue),
    onScrub: (next): void => commitStarRatio(dispatch, nodes, (node) => getStarRatioPercentage(node) + next - value),
    value,
  };
};
