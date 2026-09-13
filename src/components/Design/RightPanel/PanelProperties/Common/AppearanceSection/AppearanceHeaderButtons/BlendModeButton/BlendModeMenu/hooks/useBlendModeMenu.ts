// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { BlendMode } from 'types/design/enums';
import { isAppearanceNode } from '../../../../types';

// utils
import { commitBlendModeChange } from './utils/commitBlendModeChange';

export type TUseBlendModeMenuResult = {
  selectBlendMode: (blendMode: BlendMode) => TFunc;
  value: BlendMode;
};

export const useBlendModeMenu = (): TUseBlendModeMenuResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const id = node?.id ?? '';
  const value = node?.blendMode ?? BlendMode.passThrough;

  return {
    selectBlendMode: (blendMode: BlendMode) => (): void => commitBlendModeChange(dispatch, id, blendMode),
    value,
  };
};
