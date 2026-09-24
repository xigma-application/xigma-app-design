// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { isAppearanceNode } from '../../types';
import { TUseOpacityResult } from './types';

// utils
import { clampOpacity } from './utils/clampOpacity';
import { commitOnNodes } from '../../utils/commitOnNodes';
import { commitOpacityChange } from './utils/commitOpacityChange';
import { getOpacityPercentage } from './utils/getOpacityPercentage';

export const useOpacity = (): TUseOpacityResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectSelectedNodes).filter(isAppearanceNode);
  const [firstNode] = nodes;
  const value = getOpacityPercentage(firstNode);
  const isMixed = nodes.some((node) => getOpacityPercentage(node) !== value);
  const displayValue = isMixed ? MIXED_LABEL : `${value}%`;

  return {
    displayValue,
    onBlur: (event): void => {
      const stripped = event.target.value.trim().replace(/[^\d.-]/g, '');
      const parsed = Number(stripped);

      if (stripped !== '' && !Number.isNaN(parsed)) {
        commitOnNodes(dispatch, nodes, (node) => commitOpacityChange(dispatch, node.id, clampOpacity(parsed)));
      } else {
        event.target.value = displayValue;
      }
    },
    onScrub: (next): void =>
      commitOnNodes(dispatch, nodes, (node) =>
        commitOpacityChange(dispatch, node.id, clampOpacity(getOpacityPercentage(node) + next - value)),
      ),
    value,
  };
};
