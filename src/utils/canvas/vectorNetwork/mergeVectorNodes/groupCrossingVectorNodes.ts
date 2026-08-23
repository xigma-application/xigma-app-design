// types
import { TVectorNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from 'components/Design/Canvas/utils/bakeVectorNodeRotation';
import { doVectorNodesCross } from './doVectorNodesCross';
import { persistVectorNetworkCrossings } from '../planarizeVectorNetwork/persistVectorNetworkCrossings';

export type TVectorNodeGroup = { combinedNode: TVectorNode; nodeIds: string[] };

const collectConnectedComponent = (startId: string, adjacency: Map<string, Set<string>>, visited: Set<string>): string[] => {
  const component: string[] = [];
  const queue = [startId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (!visited.has(currentId)) {
      visited.add(currentId);
      component.push(currentId);
      adjacency.get(currentId)?.forEach((neighborId) => queue.push(neighborId));
    }
  }

  return component;
};

const buildCombinedNode = (nodeIds: string[], bakedById: Map<string, TVectorNode>): TVectorNode => {
  const [survivorId] = nodeIds; // nodeIds is derived from an already-rootOrder-sorted input — see below
  const survivor = bakedById.get(survivorId)!;
  const members = nodeIds.map((nodeId) => bakedById.get(nodeId)!);
  const segments = Object.assign({}, ...members.map((member) => member.segments));
  const rawVertices = Object.assign({}, ...members.map((member) => member.vertices));
  const vertexHandleModes = Object.assign({}, ...members.map((member) => member.vertexHandleModes));
  const filledFaceKeys = [...new Set(members.flatMap((member) => member.filledFaceKeys))];
  const persisted = persistVectorNetworkCrossings(segments, rawVertices);

  return { ...survivor, filledFaceKeys, rotation: 0, segments: persisted.segments, vertexHandleModes, vertices: persisted.vertices };
};

export const groupCrossingVectorNodes = (nodes: TVectorNode[]): TVectorNodeGroup[] => {
  const bakedById = new Map(nodes.map((node) => [node.id, { ...node, ...bakeVectorNodeRotation(node) }]));
  const adjacency = new Map<string, Set<string>>(nodes.map((node) => [node.id, new Set<string>()]));

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const nodeA = nodes[i];
      const nodeB = nodes[j];

      if (doVectorNodesCross(bakedById.get(nodeA.id)!, bakedById.get(nodeB.id)!)) {
        adjacency.get(nodeA.id)!.add(nodeB.id);
        adjacency.get(nodeB.id)!.add(nodeA.id);
      }
    }
  }

  const visited = new Set<string>();
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const groups: TVectorNodeGroup[] = [];

  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      const nodeIds = collectConnectedComponent(node.id, adjacency, visited);

      groups.push({ combinedNode: nodeIds.length === 1 ? nodesById.get(nodeIds[0])! : buildCombinedNode(nodeIds, bakedById), nodeIds });
    }
  });

  return groups;
};
