// types
import { TMaskConnectorLine } from '../../types';

export const addMaskConnectorLine = (infoById: Map<string, TMaskConnectorLine[]>, nodeId: string, line: TMaskConnectorLine): void => {
  const existing = infoById.get(nodeId);

  if (existing) {
    existing.push(line);
  } else {
    infoById.set(nodeId, [line]);
  }
};
