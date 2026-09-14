// types
import { TGradientEndpointMoveRefs } from 'types/design/canvas/types';

export const createGradientEndpointMoveRefs = (overrides: Partial<TGradientEndpointMoveRefs> = {}): TGradientEndpointMoveRefs => ({
  gradientEndpointMoveDragRef: { current: null },
  ...overrides,
});
