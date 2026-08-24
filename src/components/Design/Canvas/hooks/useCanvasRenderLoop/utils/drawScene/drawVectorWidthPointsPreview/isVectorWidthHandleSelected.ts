// types
import { TVectorWidthHandleSelection } from 'types/design/canvas/types';

export const isVectorWidthHandleSelected = (
  selectedHandles: TVectorWidthHandleSelection[],
  nodeId: string,
  pointId: string,
  side: 'left' | 'point' | 'right',
): boolean => selectedHandles.some((handle) => handle.nodeId === nodeId && handle.pointId === pointId && handle.side === side);
