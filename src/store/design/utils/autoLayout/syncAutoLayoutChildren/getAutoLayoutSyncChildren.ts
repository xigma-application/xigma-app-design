// types
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';
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
  const children = frame.childIds.map((childId) => nodes[childId]).filter(Boolean);
  const bounds = children.map((child) => getAutoLayoutChildLocalBounds(child, frame.rotation));
  const sizes = bounds.map((bound, index) => {
    const child = children[index];

    return {
      height: bound.height,
      heightSizingMode: isBoxSceneNode(child) ? child.heightSizingMode : undefined,
      id: child.id,
      maxHeight: isBoxSceneNode(child) ? child.maxHeight : undefined,
      maxWidth: isBoxSceneNode(child) ? child.maxWidth : undefined,
      minHeight: isBoxSceneNode(child) ? child.minHeight : undefined,
      minWidth: isBoxSceneNode(child) ? child.minWidth : undefined,
      width: bound.width,
      widthSizingMode: isBoxSceneNode(child) ? child.widthSizingMode : undefined,
    };
  });

  return { bounds, children, sizes };
};
