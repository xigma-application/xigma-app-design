// types
import { TVectorHandleHover } from 'types/design/canvas/types';

export const isVectorMultiSelectBoxEligible = (selectedVertexIds: string[], selectedHandles: TVectorHandleHover[]): boolean =>
  selectedHandles.length === 0 && selectedVertexIds.length > 1;
