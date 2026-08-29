import { FC } from 'react';

// components
import LayerMenu from '../LayerMenu/LayerMenu';
import { TTreeItemMenuRenderParams } from 'shared';

const LayerContextMenu: FC<TTreeItemMenuRenderParams> = ({
  anchorRef,
  isHidden,
  isLocked,
  isOpen,
  onOpenChange,
  onRenameRequested,
  onToggleHidden,
  onToggleLocked,
}) => (
  <LayerMenu
    anchorRef={anchorRef}
    isHidden={isHidden}
    isLocked={isLocked}
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    onRename={onRenameRequested}
    onToggleHidden={onToggleHidden}
    onToggleLocked={onToggleLocked}
  />
);

export default LayerContextMenu;
