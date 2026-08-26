// types
import { TPlanarVectorNetwork } from '../planarizeVectorNetwork/types';
import { TVectorNode } from 'types/design/types';
import { TVectorNodeCluster } from '../getVectorNodeClusters/types';

// utils
import { getVectorNodeClusters } from '../getVectorNodeClusters/getVectorNodeClusters';
import { getVectorNodeRawClusters } from '../getVectorNodeClusters/getVectorNodeRawClusters';

export const getClustersForStroke = (node: TVectorNode, planar: TPlanarVectorNetwork): TVectorNodeCluster[] =>
  planar.segments === node.segments && planar.vertices === node.vertices ? getVectorNodeClusters(planar) : getVectorNodeRawClusters(node);
