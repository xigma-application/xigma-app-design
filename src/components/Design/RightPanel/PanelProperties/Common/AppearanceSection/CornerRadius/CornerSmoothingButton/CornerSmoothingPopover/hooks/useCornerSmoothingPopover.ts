// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { isAppearanceNode } from '../../../../types';
import { TUseCornerSmoothingPopoverResult } from './types';

// utils
import { clampSmoothing } from './utils/clampSmoothing';
import { commitOnNodes } from '../../../../utils/commitOnNodes';
import { commitSmoothingChange } from './utils/commitSmoothingChange';
import { getSmoothingPercentage } from './utils/getSmoothingPercentage';

export const useCornerSmoothingPopover = (): TUseCornerSmoothingPopoverResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectSelectedNodes).filter(isAppearanceNode);
  const value = getSmoothingPercentage(nodes[0]);
  const isMixed = nodes.some((node) => getSmoothingPercentage(node) !== value);
  const displayValue = isMixed ? MIXED_LABEL : `${value}%`;

  const commit = (percentage: number): void =>
    commitOnNodes(dispatch, nodes, (node) => commitSmoothingChange(dispatch, node.id, clampSmoothing(percentage)));

  return {
    displayValue,
    onBlur: (event): void => {
      const stripped = event.target.value.trim().replace(/[^\d.-]/g, '');
      const parsed = Number(stripped);

      if (stripped !== '' && !Number.isNaN(parsed)) {
        commit(parsed);
      } else {
        event.target.value = displayValue;
      }
    },
    onSliderChange: commit,
    value: isMixed ? 0 : value,
  };
};
