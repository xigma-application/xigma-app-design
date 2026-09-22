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
];

const isVectorCandidate = (node: TSceneNode): node is TSvgShapeNode => VECTOR_CANDIDATE_TYPES.includes(node.type);

const addToRasterLayer = (layers: TSvgLayer[], node: TSceneNode): void => {
  const lastLayer = layers[layers.length - 1];

  if (lastLayer && lastLayer.type === SvgLayerType.raster) {
    lastLayer.nodeIds.add(node.id);
  } else {
    layers.push({ nodeIds: new Set([node.id]), type: SvgLayerType.raster });
  }
};

const addTextLayer = (
  layers: TSvgLayer[],
  node: TTextNode,
  canExportAsRealText: (node: TTextNode) => boolean,
  canExportAsTextCurves: (node: TTextNode) => boolean,
): void => {
  if (canExportAsRealText(node)) {
    layers.push({ node, type: SvgLayerType.text });
  } else if (canExportAsTextCurves(node)) {
    layers.push({ node, type: SvgLayerType.textCurves });
  } else {
    addToRasterLayer(layers, node);
  }
};

export const getSvgLayers = (
  nodes: TSceneNode[],
  canExportAsRealText: (node: TTextNode) => boolean,
  canExportAsVector: (node: TSvgShapeNode) => boolean,
  canExportAsTextCurves: (node: TTextNode) => boolean,
): TSvgLayer[] =>
  nodes.reduce<TSvgLayer[]>((layers, node) => {
    if (node.type === NodeType.text) {
      addTextLayer(layers, node, canExportAsRealText, canExportAsTextCurves);
    } else if (isVectorCandidate(node) && canExportAsVector(node)) {
      layers.push({ node, type: SvgLayerType.vector });
    } else {
      addToRasterLayer(layers, node);
    }

    return layers;
  }, []);
