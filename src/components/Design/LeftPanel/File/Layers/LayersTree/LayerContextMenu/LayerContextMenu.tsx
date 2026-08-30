import { FC } from 'react';

// components
import LayerMenu from '../LayerMenu/LayerMenu';
import { TTreeItemMenuRenderParams } from 'shared';

// hooks
import { useBringSelectionToFront } from './hooks/useBringSelectionToFront';
import { useCopySelection } from './hooks/useCopySelection';
import { useGroupSelection } from './hooks/useGroupSelection';
import { useMoveSelectionToPage } from './hooks/useMoveSelectionToPage';
import { usePasteToReplace } from './hooks/usePasteToReplace';
import { useSendSelectionToBack } from './hooks/useSendSelectionToBack';

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
  const handleBringSelectionToFront = useBringSelectionToFront();
  const handleCopySelection = useCopySelection();
  const handleGroupSelection = useGroupSelection();
  const handleMoveSelectionToPage = useMoveSelectionToPage();
  const handlePasteToReplace = usePasteToReplace();
  const handleSendSelectionToBack = useSendSelectionToBack();

  return (
    <LayerMenu
      anchorRef={anchorRef}
      isHidden={isHidden}
      isLocked={isLocked}
      isOpen={isOpen}
      onBringToFront={handleBringSelectionToFront}
      onCopy={handleCopySelection}
      onGroupSelection={handleGroupSelection}
      onMoveToPage={handleMoveSelectionToPage}
      onOpenChange={onOpenChange}
      onPasteToReplace={handlePasteToReplace}
      onRename={onRenameRequested}
      onSendToBack={handleSendSelectionToBack}
      onToggleHidden={onToggleHidden}
      onToggleLocked={onToggleLocked}
      otherPages={otherPages}
    />
  );
};

export default LayerContextMenu;
