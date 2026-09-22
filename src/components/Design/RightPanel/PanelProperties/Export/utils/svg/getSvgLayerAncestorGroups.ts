// types
import { SvgLayerType } from './enums';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';
import { TSvgAncestorGroup, TSvgLayer } from './types';

// utils
import { getSvgAncestorGroups } from './getSvgAncestorGroups';
import { isSvgBoxModelShapeNode } from './isSvgBoxModelShapeNode';

export const getSvgLayerAncestorGroups = (
  layer: TSvgLayer,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): TSvgAncestorGroup[] => {
  switch (layer.type) {
    case SvgLayerType.text:
      return getSvgAncestorGroups(layer.node.parentId, nodesById, bounds, true);
    case SvgLayerType.textCurves:
      return getSvgAncestorGroups(layer.node.parentId, nodesById, bounds, false);
    case SvgLayerType.vector:
      return getSvgAncestorGroups(layer.node.parentId, nodesById, bounds, isSvgBoxModelShapeNode(layer.node));
    default:
      return [];
  }
};
