import { FC } from 'react';

// components
import NodeContextMenu from 'components/Design/Menu/NodeContextMenu/NodeContextMenu';
import { TTreeItemMenuRenderParams } from 'shared';

// hooks
import { useNodeMenuActions } from 'components/Design/Menu/hooks/useNodeMenuActions';

// types
import { TSceneNode } from 'types/design/types';

export type TLayerContextMenuProps = TTreeItemMenuRenderParams & {
  node: TSceneNode;
};

const LayerContextMenu: FC<TLayerContextMenuProps> = ({
  anchorRef,
  isOpen,
  node,
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
      node={node}
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
