// types
import { NodeType } from 'types/design/enums';
import { PdfLayerType } from './enums';
import { TPdfLayer, TPdfShapeNode } from './types';
import { TSceneNode, TTextNode } from 'types/design/types';

const VECTOR_CANDIDATE_TYPES: NodeType[] = [
  NodeType.frame,
  NodeType.rectangle,
  NodeType.ellipse,
  NodeType.polygon,
  NodeType.star,
  NodeType.line,
];

const isVectorCandidate = (node: TSceneNode): node is TPdfShapeNode => VECTOR_CANDIDATE_TYPES.includes(node.type);

const addToRasterLayer = (layers: TPdfLayer[], node: TSceneNode): void => {
  const lastLayer = layers[layers.length - 1];

  if (lastLayer && lastLayer.type === PdfLayerType.raster) {
    lastLayer.nodeIds.add(node.id);
  } else {
    layers.push({ nodeIds: new Set([node.id]), type: PdfLayerType.raster });
  }
};

export const getPdfLayers = (
  nodes: TSceneNode[],
  canExportAsRealText: (node: TTextNode) => boolean,
  canExportAsVector: (node: TPdfShapeNode) => boolean,
): TPdfLayer[] =>
  nodes.reduce<TPdfLayer[]>((layers, node) => {
    if (node.type === NodeType.text && canExportAsRealText(node)) {
      layers.push({ node, type: PdfLayerType.text });
    } else if (isVectorCandidate(node) && canExportAsVector(node)) {
      layers.push({ node, type: PdfLayerType.vector });
    } else {
      addToRasterLayer(layers, node);
    }

    return layers;
  }, []);
