import { FC } from 'react';

// components
import LayerMenu from '../LayerMenu/LayerMenu';
import { TTreeItemMenuRenderParams } from 'shared';

// hooks
import { useCopySelection } from './hooks/useCopySelection';
import { useGroupSelection } from './hooks/useGroupSelection';
import { useMoveSelectionToPage } from './hooks/useMoveSelectionToPage';
import { usePasteToReplace } from './hooks/usePasteToReplace';

// store
import { selectActivePageId, selectPages } from 'store/design/selectors';
import { useAppSelector } from 'store';

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
  const activePageId = useAppSelector(selectActivePageId);
  const pages = useAppSelector(selectPages);
  const otherPages = Object.values(pages).filter((page) => page.id !== activePageId);
  const handleCopySelection = useCopySelection();
  const handleGroupSelection = useGroupSelection();
  const handleMoveSelectionToPage = useMoveSelectionToPage();
  const handlePasteToReplace = usePasteToReplace();

  return (
    <LayerMenu
      anchorRef={anchorRef}
      isHidden={isHidden}
      isLocked={isLocked}
      isOpen={isOpen}
      onCopy={handleCopySelection}
      onGroupSelection={handleGroupSelection}
      onMoveToPage={handleMoveSelectionToPage}
      onOpenChange={onOpenChange}
      onPasteToReplace={handlePasteToReplace}
      onRename={onRenameRequested}
      onToggleHidden={onToggleHidden}
      onToggleLocked={onToggleLocked}
      otherPages={otherPages}
    />
  );
};

export default LayerContextMenu;
