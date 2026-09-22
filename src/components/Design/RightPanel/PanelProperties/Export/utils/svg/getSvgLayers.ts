// types
import { NodeType } from 'types/design/enums';
import { SvgLayerType } from './enums';
import { TSceneNode, TTextNode } from 'types/design/types';
import { TSvgLayer, TSvgShapeNode } from './types';

const VECTOR_CANDIDATE_TYPES: NodeType[] = [
  NodeType.frame,
  NodeType.rectangle,
  NodeType.ellipse,
  NodeType.polygon,
  NodeType.star,
  NodeType.line,
  NodeType.vector,
  NodeType.media,
];

const isVectorCandidate = (node: TSceneNode): node is TSvgShapeNode => VECTOR_CANDIDATE_TYPES.includes(node.type);

const addToRasterLayer = (layers: TSvgLayer[], node: TSceneNode, contextIds: string[]): void => {
  const lastLayer = layers[layers.length - 1];

  if (lastLayer && lastLayer.type === SvgLayerType.raster) {
    lastLayer.nodeIds.add(node.id);
    lastLayer.contextIds = contextIds;
  } else {
    layers.push({ contextIds, nodeIds: new Set([node.id]), type: SvgLayerType.raster });
  }
};

const addTextLayer = (
  layers: TSvgLayer[],
  node: TTextNode,
  contextIds: string[],
  canExportAsRealText: (node: TTextNode) => boolean,
  canExportAsTextCurves: (node: TTextNode) => boolean,
): void => {
  if (canExportAsRealText(node)) {
    layers.push({ node, type: SvgLayerType.text });
  } else if (canExportAsTextCurves(node)) {
    layers.push({ node, type: SvgLayerType.textCurves });
  } else {
    addToRasterLayer(layers, node, contextIds);
  }
};

export const getSvgLayers = (
  nodes: TSceneNode[],
  canExportAsRealText: (node: TTextNode) => boolean,
  canExportAsVector: (node: TSvgShapeNode) => boolean,
  canExportAsTextCurves: (node: TTextNode) => boolean,
): TSvgLayer[] => {
  const seenIds: string[] = [];

  return nodes.reduce<TSvgLayer[]>((layers, node) => {
    seenIds.push(node.id);

    if (node.type === NodeType.text) {
      addTextLayer(layers, node, seenIds.slice(), canExportAsRealText, canExportAsTextCurves);
    } else if (isVectorCandidate(node) && canExportAsVector(node)) {
      layers.push({ node, type: SvgLayerType.vector });
    } else {
      addToRasterLayer(layers, node, seenIds.slice());
    }

    return layers;
  }, []);
};
