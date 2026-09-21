// types
import { NodeType } from 'types/design/enums';
import { PdfLayerType } from './enums';
import { TPdfLayer } from './types';
import { TSceneNode, TTextNode } from 'types/design/types';

export const getPdfLayers = (nodes: TSceneNode[], canExportAsRealText: (node: TTextNode) => boolean): TPdfLayer[] =>
  nodes.reduce<TPdfLayer[]>((layers, node) => {
    if (node.type === NodeType.text && canExportAsRealText(node)) {
      layers.push({ node, type: PdfLayerType.text });
    } else {
      const lastLayer = layers[layers.length - 1];

      if (lastLayer && lastLayer.type === PdfLayerType.raster) {
        lastLayer.nodeIds.add(node.id);
      } else {
        layers.push({ nodeIds: new Set([node.id]), type: PdfLayerType.raster });
      }
    }

    return layers;
  }, []);
