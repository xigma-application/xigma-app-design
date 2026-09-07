// types
import { SizingMode } from 'types/design/enums';
import { TBaseNode, TSceneNode } from 'types/design/types';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export type TAutoLayoutSizingModeResetChanges = Partial<Pick<TBaseNode, 'heightSizingMode' | 'widthSizingMode'>>;

export const getAutoLayoutSizingModeResetChanges = (
  node: TSceneNode,
  widthChanged: boolean,
  heightChanged: boolean,
): TAutoLayoutSizingModeResetChanges => {
  if (isBoxSceneNode(node)) {
    const widthMode = node.widthSizingMode ?? SizingMode.fixed;
    const heightMode = node.heightSizingMode ?? SizingMode.fixed;
    const changes: TAutoLayoutSizingModeResetChanges = {};

    if (widthChanged && (widthMode === SizingMode.hug || widthMode === SizingMode.fill)) {
      changes.widthSizingMode = SizingMode.fixed;
    }

    if (heightChanged && (heightMode === SizingMode.hug || heightMode === SizingMode.fill)) {
      changes.heightSizingMode = SizingMode.fixed;
    }

    return changes;
  }

  return {};
};
