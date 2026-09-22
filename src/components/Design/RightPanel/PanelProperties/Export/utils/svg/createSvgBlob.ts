// store
import { selectNodes, selectRootOrder } from 'store/design/selectors';
import { store } from 'store';

// types
import { ExportImageResampling } from '../../enums';
import { SvgLayerType } from './enums';
import { TSceneNode, TTextNode } from 'types/design/types';
import { TSvgAncestorGroup, TSvgShapeNode } from './types';

// utils
import { canExportShapeAsSvgVector } from './canExportShapeAsSvgVector';
import { canExportTextAsSvgRealText } from './canExportTextAsSvgRealText';
import { canExportTextOnPathAsVectorCurves } from '../canExportTextOnPathAsVectorCurves';
import { drawSvgShape } from './drawSvgShape';
import { drawSvgTextCurves } from './drawSvgTextCurves';
import { drawSvgTextNode } from './drawSvgTextNode';
import { embedSvgRasterLayer } from './embedSvgRasterLayer';
import { formatSvgNumber } from './formatSvgNumber';
import { getExportRenderNodes } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getExportRenderNodes';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { getSvgLayerAncestorGroups } from './getSvgLayerAncestorGroups';
import { getSvgLayers } from './getSvgLayers';
import { getSvgLocalizedNode } from './getSvgLocalizedNode';
import { isSvgBoxModelShapeNode } from './isSvgBoxModelShapeNode';
import { updateSvgAncestorGroupStack } from './updateSvgAncestorGroupStack';

export const createSvgBlob = async (
  nodeId: string,
  rasterScale: number,
  ignoreOverlappingLayers: boolean,
  imageResampling: ExportImageResampling,
  jpegQuality: number,
): Promise<Blob | null> => {
  const state = store.getState();
  const nodesById: Record<string, TSceneNode> = selectNodes(state);
  const node = nodesById[nodeId];

  if (node) {
    const bounds = getRotatedNodeBounds(node);
    const nodes = getExportRenderNodes(nodeId, nodesById, selectRootOrder(state), ignoreOverlappingLayers);
    const layers = getSvgLayers(
      nodes,
      (textNode: TTextNode) => canExportTextAsSvgRealText(textNode, nodesById),
      (shapeNode: TSvgShapeNode) => canExportShapeAsSvgVector(shapeNode, nodesById),
      (textNode: TTextNode) => canExportTextOnPathAsVectorCurves(textNode, nodesById),
    );
    const isSoleRasterLayer = layers.length === 1 && layers[0].type === SvgLayerType.raster;
    const elements: string[] = [];
    const defs: string[] = [];
    let openGroups: TSvgAncestorGroup[] = [];

    for (const layer of layers) {
      openGroups = updateSvgAncestorGroupStack(elements, openGroups, getSvgLayerAncestorGroups(layer, nodesById, bounds));

      switch (layer.type) {
        case SvgLayerType.text:
          drawSvgTextNode(elements, getSvgLocalizedNode(layer.node, nodesById), bounds);
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
            layer.nodeIds,
            bounds,
            isSoleRasterLayer,
            jpegQuality,
          );
          break;
      }
    }

    updateSvgAncestorGroupStack(elements, openGroups, []);

    const width = formatSvgNumber(bounds.width);
    const height = formatSvgNumber(bounds.height);
    const defsMarkup = defs.length > 0 ? `<defs>${defs.join('')}</defs>` : '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defsMarkup}${elements.join('')}</svg>`;

    return new Blob([svg], { type: 'image/svg+xml' });
  }

  return null;
};
