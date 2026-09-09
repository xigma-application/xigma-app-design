// types
import { NodeType } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TDraftRect } from 'types/canvas';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getAutoLayoutChildLocalBounds } from '../getAutoLayoutChildLocalBounds';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export type TAutoLayoutSyncChildren = {
  bounds: TDraftRect[];
  children: TSceneNode[];
  sizes: TAutoLayoutChildSize[];
};

export const getAutoLayoutSyncChildren = (frame: TFrameNode, nodes: Record<string, TSceneNode>): TAutoLayoutSyncChildren => {
  const children = frame.childIds
    .map((childId) => nodes[childId])
    .filter((child): child is TSceneNode => Boolean(child) && !(isBoxSceneNode(child) && child.ignoreAutoLayout));
  const bounds = children.map((child) => getAutoLayoutChildLocalBounds(child, frame.rotation));
  const sizes = bounds.map((bound, index) => {
    const child = children[index];

    return {
      fontSize: child.type === NodeType.text ? child.fontSize : undefined,
      gridChildHorizontalAlign: isBoxSceneNode(child) ? child.gridChildHorizontalAlign : undefined,
      gridChildVerticalAlign: isBoxSceneNode(child) ? child.gridChildVerticalAlign : undefined,
      gridColumnAnchorIndex: isBoxSceneNode(child) ? child.gridColumnAnchorIndex : undefined,
      gridColumnSpan: isBoxSceneNode(child) ? child.gridColumnSpan : undefined,
      gridRowAnchorIndex: isBoxSceneNode(child) ? child.gridRowAnchorIndex : undefined,
      gridRowSpan: isBoxSceneNode(child) ? child.gridRowSpan : undefined,
      height: bound.height,
      heightSizingMode: isBoxSceneNode(child) ? child.heightSizingMode : undefined,
      id: child.id,
      maxHeight: isBoxSceneNode(child) ? child.maxHeight : undefined,
      maxWidth: isBoxSceneNode(child) ? child.maxWidth : undefined,
      minHeight: isBoxSceneNode(child) ? child.minHeight : undefined,
      minWidth: isBoxSceneNode(child) ? child.minWidth : undefined,
      strokeAlign: isBoxSceneNode(child) && 'strokeAlign' in child ? child.strokeAlign : undefined,
      strokeWidth: isBoxSceneNode(child) && 'strokeWidth' in child ? child.strokeWidth : undefined,
      width: bound.width,
      widthSizingMode: isBoxSceneNode(child) ? child.widthSizingMode : undefined,
    };
  });

  return { bounds, children, sizes };
};
