// types
import { TSelectedVectorPointsEntry } from '../types';
import { TVertexHandleMode } from 'types/design/types';

export const getVectorPointsMirroring = (entries: TSelectedVectorPointsEntry[]): TVertexHandleMode | '' => {
  const modes = new Set(entries.flatMap(({ node, pointIds }) => pointIds.map((vertexId) => node.vertexHandleModes[vertexId] ?? 'corner')));
  const [mode] = modes;

  return modes.size === 1 ? mode : '';
};
