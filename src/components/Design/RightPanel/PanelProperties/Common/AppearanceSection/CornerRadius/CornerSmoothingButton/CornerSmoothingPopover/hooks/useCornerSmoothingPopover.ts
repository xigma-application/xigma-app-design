// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { isAppearanceNode } from '../../../../types';
import { TUseCornerSmoothingPopoverResult } from './types';

// utils
import { clampSmoothing } from './utils/clampSmoothing';
import { commitSmoothingChange } from './utils/commitSmoothingChange';

export const useCornerSmoothingPopover = (): TUseCornerSmoothingPopoverResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const id = node?.id ?? '';
  const value = clampSmoothing((node?.cornerSmoothing ?? 0) * 100);
  const commit = (percentage: number): void => commitSmoothingChange(dispatch, id, clampSmoothing(percentage));

  return {
    onBlur: (event): void => {
      const stripped = event.target.value.trim().replace(/[^\d.-]/g, '');
      const parsed = Number(stripped);

      if (stripped !== '' && !Number.isNaN(parsed)) {
        commit(parsed);
      } else {
        event.target.value = `${value}%`;
      }
    },
    onSliderChange: commit,
    value,
  };
};
