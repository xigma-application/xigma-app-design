import { useState } from 'react';

// @xigma
import { TIconProps } from '@xigma/components';

// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { BlendMode } from 'types/design/enums';
import { isAppearanceNode } from '../../../types';

// utils
import { commitBlendModeChange } from './utils/commitBlendModeChange';

export type TUseBlendModeButtonResult = {
  icon: TIconProps['name'];
  isDefault: boolean;
  nodeId: string;
  onOpenChange: TFunc<[boolean]>;
  open: boolean;
  selectBlendMode: (blendMode: BlendMode) => TFunc;
  value: BlendMode;
};

export const useBlendModeButton = (): TUseBlendModeButtonResult => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { blendMode: blendModeRefs } = useCanvasRefsContext();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const id = node?.id ?? '';
  const value = node?.blendMode ?? BlendMode.passThrough;
  const isDefault = value === BlendMode.passThrough;

  return {
    icon: isDefault ? 'DropEmpty' : 'DropFilled',
    isDefault,
    nodeId: id,
    onOpenChange: (nextOpen): void => {
      if (nextOpen && !isDefault) {
        commitBlendModeChange(dispatch, id, BlendMode.passThrough);
      } else {
        setOpen(nextOpen);

        if (!nextOpen) {
          blendModeRefs.previewRef.current = null;
        }
      }
    },
    open,
    selectBlendMode: (blendMode: BlendMode) => (): void => commitBlendModeChange(dispatch, id, blendMode),
    value,
  };
};
