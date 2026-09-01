import { FC, ReactNode } from 'react';

// components
import CanvasContextMenu from 'components/Design/Menu/CanvasContextMenu/CanvasContextMenu';
import NodeContextMenu from 'components/Design/Menu/NodeContextMenu/NodeContextMenu';

// hooks
import { useCanvasContextMenu } from '../hooks/useCanvasContextMenu/useCanvasContextMenu';
import { useNodeMenuActions } from 'components/Design/Menu/hooks/useNodeMenuActions';

// store
import { toggleNodeHidden, toggleNodeLocked, toggleNodeMask, toggleUiMinimized } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

export type TCanvasContextMenuPanelProps = {
  children: ReactNode;
  className: string;
  refs: TCanvasRefs;
};

const CanvasContextMenuPanel: FC<TCanvasContextMenuPanelProps> = ({ children, className, refs }) => {
  const dispatch = useAppDispatch();
  const { anchorRef, hitNode, isOpen, onContextMenu, onOpenChange } = useCanvasContextMenu(refs);
  const nodeMenuActions = useNodeMenuActions();

  return (
    <div className={className} onContextMenu={onContextMenu}>
      {children}
      {hitNode ? (
        <NodeContextMenu
          {...nodeMenuActions}
          anchorRef={anchorRef}
          isOpen={isOpen}
          node={hitNode}
          onOpenChange={onOpenChange}
          onRemoveMask={(): void => {
            dispatch(toggleNodeMask(hitNode.id));
          }}
          onToggleHidden={(): void => {
            dispatch(toggleNodeHidden(hitNode.id));
          }}
          onToggleLocked={(): void => {
            dispatch(toggleNodeLocked(hitNode.id));
          }}
        />
      ) : (
        <CanvasContextMenu
          anchorRef={anchorRef}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onToggleUiMinimized={(): void => {
            dispatch(toggleUiMinimized());
          }}
        />
      )}
    </div>
  );
};

export default CanvasContextMenuPanel;
