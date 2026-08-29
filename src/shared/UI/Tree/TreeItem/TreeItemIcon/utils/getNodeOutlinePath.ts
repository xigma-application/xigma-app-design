// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TPathNode, TSceneNode } from 'types/design/types';
import { TNodeOutline } from '../types';

// utils
import { buildVectorNetworkPathD } from './buildVectorNetworkPathD';
import { convertEllipseToVector } from 'utils/canvas/vectorNetwork/convertShapeToVector/convertEllipseToVector';
import { convertNodeToVector } from 'utils/canvas/vectorNetwork/convertShapeToVector/convertNodeToVector';
import { fitVectorNetworkToViewBox, TVectorNetwork } from './fitVectorNetworkToViewBox';

const asEllipseNode = (node: TPathNode): TEllipseNode => ({ ...node, fill: '', type: NodeType.ellipse });

const getNodeVectorNetwork = (node: TSceneNode): TVectorNetwork | null => {
  switch (node.type) {
    case NodeType.vector:
      return { segments: node.segments, vertices: node.vertices };
    case NodeType.path:
      return convertEllipseToVector(asEllipseNode(node));
    case NodeType.rectangle:
    case NodeType.ellipse:
    case NodeType.polygon:
    case NodeType.star:
    case NodeType.line:
      return convertNodeToVector(node);
    default:
      return null;
  }
};

export const getNodeOutlinePath = (node: TSceneNode): TNodeOutline | null => {
  const network = getNodeVectorNetwork(node);

  if (network) {
    const fitted = fitVectorNetworkToViewBox(network.vertices, network.segments);
    return { d: buildVectorNetworkPathD(fitted.vertices, fitted.segments) };
  }

  return null;
};
