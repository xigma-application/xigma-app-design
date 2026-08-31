import { FC } from 'react';

// components
import NodeContextMenu from 'components/Design/Menu/NodeContextMenu/NodeContextMenu';
import { TTreeItemMenuRenderParams } from 'shared';

// hooks
import { useNodeMenuActions } from 'components/Design/Menu/hooks/useNodeMenuActions';

// types
import { NodeType } from 'types/design/enums';

export type TLayerContextMenuProps = TTreeItemMenuRenderParams & {
  nodeType: NodeType;
};

const LayerContextMenu: FC<TLayerContextMenuProps> = ({
  anchorRef,
  isOpen,
  nodeType,
  onOpenChange,
  onRenameRequested,
  onToggleHidden,
  onToggleLocked,
}) => {
  const { onBringToFront, onCopy, onGroupSelection, onMoveToPage, onPasteToReplace, onSendToBack, otherPages } = useNodeMenuActions();

  return (
    <NodeContextMenu
      anchorRef={anchorRef}
      isOpen={isOpen}
      nodeType={nodeType}
      onBringToFront={onBringToFront}
      onCopy={onCopy}
      onGroupSelection={onGroupSelection}
      onMoveToPage={onMoveToPage}
      onOpenChange={onOpenChange}
      onPasteToReplace={onPasteToReplace}
      onRename={onRenameRequested}
      onSendToBack={onSendToBack}
      onToggleHidden={onToggleHidden}
      onToggleLocked={onToggleLocked}
      otherPages={otherPages}
    />
  );
};

export default LayerContextMenu;
