// store
import { selectNodes, selectRootOrder } from 'store/design/selectors';
import { store } from 'store';

// types
import { ExportImageResampling } from '../../enums';
import { SvgLayerType } from './enums';
import { TSceneNode } from 'types/design/types';
import { TSvgShapeNode } from './types';

// utils
import { canExportShapeAsSvgVector } from './canExportShapeAsSvgVector';
import { drawSvgShape } from './drawSvgShape';
import { embedSvgRasterLayer } from './embedSvgRasterLayer';
import { formatSvgNumber } from './formatSvgNumber';
import { getExportRenderNodes } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getExportRenderNodes';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { getSvgLayers } from './getSvgLayers';

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
    const layers = getSvgLayers(nodes, (shapeNode: TSvgShapeNode) => canExportShapeAsSvgVector(shapeNode, nodesById));
    const isSoleRasterLayer = layers.length === 1 && layers[0].type === SvgLayerType.raster;
    const elements: string[] = [];

    for (const layer of layers) {
      if (layer.type === SvgLayerType.vector) {
        drawSvgShape(elements, layer.node, nodesById, bounds);
      } else {
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
      }
    }

    const width = formatSvgNumber(bounds.width);
    const height = formatSvgNumber(bounds.height);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${elements.join('')}</svg>`;

    return new Blob([svg], { type: 'image/svg+xml' });
  }

  return null;
};
