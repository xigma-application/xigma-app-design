// types
import { TVectorNode, TVertexHandleMode } from 'types/design/types';

export const getVectorPointsMirroring = (node: TVectorNode, vertexIds: string[]): TVertexHandleMode | '' => {
  const modes = new Set(vertexIds.map((vertexId) => node.vertexHandleModes[vertexId] ?? 'corner'));
  const [mode] = modes;

  return modes.size === 1 ? mode : '';
};
