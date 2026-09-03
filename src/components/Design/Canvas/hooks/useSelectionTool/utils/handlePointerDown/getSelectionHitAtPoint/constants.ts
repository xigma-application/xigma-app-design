// utils
import { resolveClickThroughFrameHit } from './resolveClickThroughFrameHit';
import { resolveContainerDrillHit } from './resolveContainerDrillHit';
import { resolveSelectedNodeHit } from './resolveSelectedNodeHit';

// types
import { TSelectionHitResolver } from './types';

export const SELECTION_HIT_RESOLVERS: TSelectionHitResolver[] = [
  resolveSelectedNodeHit,
  resolveClickThroughFrameHit,
  resolveContainerDrillHit,
];
