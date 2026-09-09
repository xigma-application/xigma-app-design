import { useState } from 'react';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

export type TUseAutoLayoutSettingsButtonResult = {
  layoutMode: LayoutMode | undefined;
  onClose: TFunc;
  onOpenChange: TFunc<[boolean]>;
  open: boolean;
};

export const useAutoLayoutSettingsButton = (): TUseAutoLayoutSettingsButtonResult => {
  const [open, setOpen] = useState(false);
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const layoutMode = selectedNode?.type === NodeType.frame ? selectedNode.layoutMode : undefined;

  return {
    layoutMode,
    onClose: () => setOpen(false),
    onOpenChange: (nextOpen: boolean) => setOpen(nextOpen),
    open,
  };
};
