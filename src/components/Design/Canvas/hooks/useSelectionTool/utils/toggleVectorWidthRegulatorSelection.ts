// types
import { TVectorWidthHandleSelection } from 'types/design/canvas/types';

export const toggleVectorWidthRegulatorSelection = (
  current: TVectorWidthHandleSelection[],
  nodeId: string,
  pointId: string,
): TVectorWidthHandleSelection[] =>
  current.some((selected) => selected.side === 'point' && selected.nodeId === nodeId && selected.pointId === pointId)
    ? current.filter((selected) => !(selected.nodeId === nodeId && selected.pointId === pointId))
    : [...current, { nodeId, pointId, side: 'point' }];
