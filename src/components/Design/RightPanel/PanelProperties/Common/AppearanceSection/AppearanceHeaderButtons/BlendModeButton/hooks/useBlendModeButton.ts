import { useState } from 'react';

// @xigma
import { TIconProps } from '@xigma/components';

// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { selectAppearanceNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { BlendMode } from 'types/design/enums';

// utils
import { isOpacityPanelNode } from '../../../utils/isOpacityPanelNode';
import { commitBlendModeToNodes } from './utils/commitBlendModeToNodes';
import { getSharedBlendMode } from './utils/getSharedBlendMode';

export type TUseBlendModeButtonResult = {
  icon: TIconProps['name'];
  isDefault: boolean;
  nodeIds: string[];
  onOpenChange: TFunc<[boolean]>;
  open: boolean;
  selectBlendMode: (blendMode: BlendMode) => TFunc;
  value: BlendMode | undefined;
};

export const useBlendModeButton = (): TUseBlendModeButtonResult => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { blendMode: blendModeRefs } = useCanvasRefsContext();
  const nodes = useAppSelector(selectAppearanceNodes).filter(isOpacityPanelNode);
  const value = getSharedBlendMode(nodes);
  const isDefault = value === BlendMode.passThrough;

  return {
    icon: isDefault ? 'DropEmpty' : 'DropFilled',
    isDefault,
    nodeIds: nodes.map((node) => node.id),
    onOpenChange: (nextOpen): void => {
      if (nextOpen && !isDefault) {
        commitBlendModeToNodes(dispatch, nodes, BlendMode.passThrough);
      } else {
        setOpen(nextOpen);

        if (!nextOpen) {
          blendModeRefs.previewRef.current = null;
        }
      }
    },
    open,
    selectBlendMode: (blendMode: BlendMode) => (): void => commitBlendModeToNodes(dispatch, nodes, blendMode),
    value,
  };
};
