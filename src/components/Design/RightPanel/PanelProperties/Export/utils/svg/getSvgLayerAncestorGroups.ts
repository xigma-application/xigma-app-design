// types
import { SvgLayerType } from './enums';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';
import { TSvgAncestorGroup, TSvgLayer } from './types';

// utils
import { getSvgRotatedAncestorGroups } from './getSvgRotatedAncestorGroups';
import { isSvgBoxModelShapeNode } from './isSvgBoxModelShapeNode';

export const getSvgLayerAncestorGroups = (
  layer: TSvgLayer,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): TSvgAncestorGroup[] => {
  switch (layer.type) {
    case SvgLayerType.text:
      return getSvgRotatedAncestorGroups(layer.node.parentId, nodesById, bounds);
    case SvgLayerType.vector:
      return isSvgBoxModelShapeNode(layer.node) ? getSvgRotatedAncestorGroups(layer.node.parentId, nodesById, bounds) : [];
    default:
      return [];
  }
};
