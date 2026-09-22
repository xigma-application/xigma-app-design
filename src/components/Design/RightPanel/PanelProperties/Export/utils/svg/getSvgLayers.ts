// types
import { NodeType } from 'types/design/enums';
import { SvgLayerType } from './enums';
import { TSceneNode } from 'types/design/types';
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

export const getSvgLayers = (nodes: TSceneNode[], canExportAsVector: (node: TSvgShapeNode) => boolean): TSvgLayer[] =>
  nodes.reduce<TSvgLayer[]>((layers, node) => {
    if (isVectorCandidate(node) && canExportAsVector(node)) {
      layers.push({ node, type: SvgLayerType.vector });
    } else {
      addToRasterLayer(layers, node);
    }

    return layers;
  }, []);
