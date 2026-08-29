import { ReactNode, RefObject } from 'react';

// hooks
import { TVirtualAnchor } from './hooks/useTreeItemContextMenu';

export type { TVirtualAnchor };

export type TTreeItemMenuRenderParams = {
  anchorRef: RefObject<TVirtualAnchor>;
  isHidden: boolean;
  isLocked: boolean;
  isOpen: boolean;
  onOpenChange: TFunc<[boolean]>;
  onRenameRequested: TFunc;
  onToggleHidden: TFunc;
  onToggleLocked: TFunc;
};

export type TRenderTreeItemMenu = (params: TTreeItemMenuRenderParams) => ReactNode;
