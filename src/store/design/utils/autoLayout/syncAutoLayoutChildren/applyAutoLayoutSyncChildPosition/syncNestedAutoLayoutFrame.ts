// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TDesignState } from '../../../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { syncAutoLayoutChildren } from '../syncAutoLayoutChildren';

export const syncNestedAutoLayoutFrame = (state: TDesignState, child: TSceneNode): void => {
  if (
    child.type === NodeType.frame &&
    (child.layoutMode === LayoutMode.horizontal || child.layoutMode === LayoutMode.vertical || child.layoutMode === LayoutMode.grid)
  ) {
    syncAutoLayoutChildren(state, child.id);
  }
};
