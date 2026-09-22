// store
import { selectBackgroundPaint, selectNodes, selectRootOrder } from 'store/design/selectors';
import { store } from 'store';

// types
import { ExportImageResampling } from '../../../enums';
import { SvgLayerType } from '../enums';
import { TDraftRect } from 'types/canvas';
import { TSceneNode, TTextNode } from 'types/design/types';
import { TSvgAncestorGroup, TSvgShapeNode } from '../types';

// utils
import { canExportShapeAsSvgVector } from '../canExportShapeAsSvgVector';
import { canExportTextAsOutline } from '../../canExportTextAsOutline';
import { canExportTextAsSvgRealText } from '../canExportTextAsSvgRealText';
import { canExportTextOnPathAsVectorCurves } from '../../canExportTextOnPathAsVectorCurves';
import { drawSvgLayer } from './drawSvgLayer';
import { drawSvgPageBackground } from '../drawSvgPageBackground';
import { getExportRenderNodes } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getExportRenderNodes';
import { getRenderOrderedNodes } from 'store/design/utils/getRenderOrderedNodes';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { getSvgBlobMarkup } from './getSvgBlobMarkup';
import { getSvgLayers } from '../getSvgLayers';
import { updateSvgAncestorGroupStack } from '../updateSvgAncestorGroupStack';

type TSvgExportSource = { bounds: TDraftRect; nodes: TSceneNode[] };

const getSvgExportSource = (
  nodeId: string | null,
  nodesById: Record<string, TSceneNode>,
  rootOrder: string[],
  ignoreOverlappingLayers: boolean,
  boundsOverride: TDraftRect | undefined,
): TSvgExportSource | null => {
  if (nodeId === null) {
    return boundsOverride
      ? { bounds: boundsOverride, nodes: getRenderOrderedNodes(rootOrder, nodesById).filter((node) => !node.hidden) }
      : null;
  }

  const node = nodesById[nodeId];

  return node
    ? {
        bounds: boundsOverride ?? getRotatedNodeBounds(node),
        nodes: getExportRenderNodes(nodeId, nodesById, rootOrder, ignoreOverlappingLayers),
      }
    : null;
};

export const createSvgBlob = async (
  nodeId: string | null,
  rasterScale: number,
  ignoreOverlappingLayers: boolean,
  imageResampling: ExportImageResampling,
  jpegQuality: number,
  outlineText: boolean = false,
  includeIdAttribute: boolean = false,
  boundsOverride?: TDraftRect,
): Promise<Blob | null> => {
  const state = store.getState();
  const nodesById: Record<string, TSceneNode> = selectNodes(state);
  const source = getSvgExportSource(nodeId, nodesById, selectRootOrder(state), ignoreOverlappingLayers, boundsOverride);

  if (source) {
    const { bounds, nodes } = source;
    const layers = getSvgLayers(
      nodes,
      (textNode: TTextNode) => !outlineText && canExportTextAsSvgRealText(textNode, nodesById),
      (shapeNode: TSvgShapeNode) => canExportShapeAsSvgVector(shapeNode, nodesById),
      (textNode: TTextNode) =>
        outlineText ? canExportTextAsOutline(textNode, nodesById, true) : canExportTextOnPathAsVectorCurves(textNode, nodesById, true),
    );
    const context = {
      bounds,
      ignoreOverlappingLayers,
      imageResampling,
      includeIdAttribute,
      isSoleRasterLayer: layers.length === 1 && layers[0].type === SvgLayerType.raster,
      jpegQuality,
      nodeId,
      nodesById,
      rasterScale,
    };
    const elements: string[] = [];
    const defs: string[] = [];
    const usedIds = new Map<string, number>();
    let openGroups: TSvgAncestorGroup[] = [];

    if (nodeId === null) {
      drawSvgPageBackground(elements, bounds, selectBackgroundPaint(state));
    }

    for (const layer of layers) {
      openGroups = await drawSvgLayer(elements, defs, layer, context, openGroups, usedIds);
    }

    updateSvgAncestorGroupStack(elements, openGroups, []);

    return new Blob([getSvgBlobMarkup(bounds, defs, elements)], { type: 'image/svg+xml' });
  }

  return null;
};
