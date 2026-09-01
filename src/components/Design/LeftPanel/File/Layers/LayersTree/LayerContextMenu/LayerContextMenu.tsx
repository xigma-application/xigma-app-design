import { FC } from 'react';

// components
import NodeContextMenu from 'components/Design/Menu/NodeContextMenu/NodeContextMenu';
import { TTreeItemMenuRenderParams } from 'shared';

// hooks
import { useNodeMenuActions } from 'components/Design/Menu/hooks/useNodeMenuActions';
import { useRemoveNodeMask } from 'components/Design/Menu/hooks/useRemoveNodeMask';

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
  const {
    onBringToFront,
    onCopy,
    onFlatten,
    onGroupSelection,
    onMoveToPage,
    onOutlineStroke,
    onPasteToReplace,
    onSendToBack,
    onUseAsMask,
    otherPages,
  } = useNodeMenuActions();
  const onRemoveMask = useRemoveNodeMask(node.id);

  return (
    <NodeContextMenu
      anchorRef={anchorRef}
      isOpen={isOpen}
      node={node}
      onBringToFront={onBringToFront}
      onCopy={onCopy}
      onFlatten={onFlatten}
      onGroupSelection={onGroupSelection}
      onMoveToPage={onMoveToPage}
      onOpenChange={onOpenChange}
      onOutlineStroke={onOutlineStroke}
      onPasteToReplace={onPasteToReplace}
      onRemoveMask={onRemoveMask}
      onRename={onRenameRequested}
      onSendToBack={onSendToBack}
      onToggleHidden={onToggleHidden}
      onToggleLocked={onToggleLocked}
      onUseAsMask={onUseAsMask}
      otherPages={otherPages}
    />
  );
};

export default LayerContextMenu;
