// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

export type TAutoLayoutSizingModeResetChanges = Partial<Pick<TFrameNode, 'counterAxisSizingMode' | 'primaryAxisSizingMode'>>;

export const getAutoLayoutSizingModeResetChanges = (
  node: TSceneNode,
  widthChanged: boolean,
  heightChanged: boolean,
): TAutoLayoutSizingModeResetChanges => {
  const isAutoLayoutFrame =
    node.type === NodeType.frame && (node.layoutMode === LayoutMode.horizontal || node.layoutMode === LayoutMode.vertical);

  if (isAutoLayoutFrame) {
    const isHorizontal = node.layoutMode === LayoutMode.horizontal;
    const primaryAxisSizingMode = node.primaryAxisSizingMode ?? SizingMode.fixed;
    const counterAxisSizingMode = node.counterAxisSizingMode ?? SizingMode.fixed;
    const widthField = isHorizontal ? 'primaryAxisSizingMode' : 'counterAxisSizingMode';
    const heightField = isHorizontal ? 'counterAxisSizingMode' : 'primaryAxisSizingMode';
    const widthMode = isHorizontal ? primaryAxisSizingMode : counterAxisSizingMode;
    const heightMode = isHorizontal ? counterAxisSizingMode : primaryAxisSizingMode;
    const changes: TAutoLayoutSizingModeResetChanges = {};

    if (widthChanged && widthMode === SizingMode.hug) {
      changes[widthField] = SizingMode.fixed;
    }

    if (heightChanged && heightMode === SizingMode.hug) {
      changes[heightField] = SizingMode.fixed;
    }

    return changes;
  }

  return {};
};
