// types
import { TMaskConnectorLine } from '../../types';

export const getMaskConnectorPassthroughForChildren = (passthrough: TMaskConnectorLine[]): TMaskConnectorLine[] =>
  passthrough.filter((line) => line.role !== 'mask').map((line) => ({ depthOffset: line.depthOffset + 1, role: 'masked-continue' }));
