import { FC } from 'react';

// components
import LayerMenu from '../LayerMenu/LayerMenu';
import { TTreeItemMenuRenderParams } from 'shared';

// hooks
import { useCopySelection } from './hooks/useCopySelection';
import { useGroupSelection } from './hooks/useGroupSelection';
import { usePasteToReplace } from './hooks/usePasteToReplace';

const LayerContextMenu: FC<TTreeItemMenuRenderParams> = ({
  anchorRef,
  isHidden,
  isLocked,
  isOpen,
  onOpenChange,
  onRenameRequested,
  onToggleHidden,
  onToggleLocked,
}) => {
  const handleCopySelection = useCopySelection();
  const handleGroupSelection = useGroupSelection();
  const handlePasteToReplace = usePasteToReplace();

  return (
    <LayerMenu
      anchorRef={anchorRef}
      isHidden={isHidden}
      isLocked={isLocked}
      isOpen={isOpen}
      onCopy={handleCopySelection}
      onGroupSelection={handleGroupSelection}
      onOpenChange={onOpenChange}
      onPasteToReplace={handlePasteToReplace}
      onRename={onRenameRequested}
      onToggleHidden={onToggleHidden}
      onToggleLocked={onToggleLocked}
    />
  );
};

export default LayerContextMenu;
