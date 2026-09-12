// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { isAppearanceNode } from '../../types';
import { TUseOpacityResult } from './types';

// utils
import { clampOpacity } from './utils/clampOpacity';
import { commitOpacityChange } from './utils/commitOpacityChange';

export const useOpacity = (): TUseOpacityResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const id = node?.id ?? '';
  const value = clampOpacity((node?.opacity ?? 1) * 100);
  const commit = (percentage: number): void => commitOpacityChange(dispatch, id, clampOpacity(percentage));

  return {
    onBlur: (event): void => {
      const parsed = Number(event.target.value.replace(/[^\d.-]/g, ''));

      if (event.target.value.trim() !== '' && !Number.isNaN(parsed)) {
        commit(parsed);
      } else {
        event.target.value = `${value}%`;
      }
    },
    onScrub: commit,
    value,
  };
};
