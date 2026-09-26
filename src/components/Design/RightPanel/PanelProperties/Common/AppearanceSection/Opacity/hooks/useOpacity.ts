// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { selectAppearanceNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TUseOpacityResult } from './types';

// utils
import { clampOpacity } from './utils/clampOpacity';
import { commitOnNodes } from '../../utils/commitOnNodes';
import { isStyledOrVectorNode } from '../../utils/isStyledOrVectorNode';
import { commitOpacityChange } from './utils/commitOpacityChange';
import { getOpacityPercentage } from './utils/getOpacityPercentage';
import { handleOpacityBlur } from './utils/handleOpacityBlur';

export const useOpacity = (): TUseOpacityResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectAppearanceNodes).filter(isStyledOrVectorNode);
  const [firstNode] = nodes;
  const value = getOpacityPercentage(firstNode);
  const isMixed = nodes.some((node) => getOpacityPercentage(node) !== value);
  const displayValue = isMixed ? MIXED_LABEL : `${value}%`;

  return {
    displayValue,
    onBlur: (event): void => handleOpacityBlur(event, dispatch, nodes, displayValue),
    onScrub: (next): void =>
      commitOnNodes(dispatch, nodes, (node) =>
        commitOpacityChange(dispatch, node.id, clampOpacity(getOpacityPercentage(node) + next - value)),
      ),
    value,
  };
};
