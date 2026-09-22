// types
import { SvgLayerType } from '../enums';
import { TSvgAncestorGroup, TSvgLayer } from '../types';
import { TSvgDrawContext } from './types';

// utils
import { drawSvgShape } from '../drawSvgShape';
import { drawSvgTextCurves } from '../drawSvgTextCurves';
import { drawSvgTextNode } from '../drawSvgTextNode';
import { embedSvgRasterLayer } from '../embedSvgRasterLayer';
import { getSvgElementId } from '../getSvgElementId';
import { getSvgLayerAncestorGroups } from '../getSvgLayerAncestorGroups';
import { getSvgLocalizedNode } from '../getSvgLocalizedNode';
import { isSvgBoxModelShapeNode } from '../isSvgBoxModelShapeNode';
import { updateSvgAncestorGroupStack } from '../updateSvgAncestorGroupStack';

export const drawSvgLayer = async (
  elements: string[],
  defs: string[],
  layer: TSvgLayer,
  context: TSvgDrawContext,
  openGroups: TSvgAncestorGroup[],
  usedIds: Map<string, number>,
): Promise<TSvgAncestorGroup[]> => {
  const {
    bounds,
    ignoreOverlappingLayers,
    imageResampling,
    includeIdAttribute,
    isSoleRasterLayer,
    jpegQuality,
    nodeId,
    nodesById,
    rasterScale,
  } = context;
  const nextOpenGroups = updateSvgAncestorGroupStack(elements, openGroups, getSvgLayerAncestorGroups(layer, nodesById, bounds));
  const idAttribute = includeIdAttribute && layer.type !== SvgLayerType.raster ? getSvgElementId(layer.node, usedIds) : null;

  if (idAttribute) {
    elements.push(`<g id="${idAttribute}">`);
  }

  switch (layer.type) {
    case SvgLayerType.text:
      drawSvgTextNode(elements, getSvgLocalizedNode(layer.node, nodesById), nodesById, bounds);
      break;
    case SvgLayerType.textCurves:
      await drawSvgTextCurves(elements, defs, layer.node, nodesById, bounds);
      break;
    case SvgLayerType.vector: {
      const shapeNode = isSvgBoxModelShapeNode(layer.node) ? getSvgLocalizedNode(layer.node, nodesById) : layer.node;
      await drawSvgShape(elements, defs, shapeNode, nodesById, bounds);
      break;
    }
    default:
      await embedSvgRasterLayer(
        elements,
        nodeId,
        rasterScale,
        ignoreOverlappingLayers,
        imageResampling,
        layer.contextIds,
        bounds,
        isSoleRasterLayer,
        jpegQuality,
      );
      break;
  }

  if (idAttribute) {
    elements.push('</g>');
  }

  return nextOpenGroups;
};
