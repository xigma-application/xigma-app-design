// types
import { TLineStrokeShape } from 'utils/canvas/line/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorEffectLayers } from './getVectorEffectLayers';
import { hasVectorShapeEffects } from './hasVectorShapeEffects';

export const getVectorSnapshotEffectLayers = (node: TVectorNode): TLineStrokeShape[] =>
  hasVectorShapeEffects(node) ? getVectorEffectLayers(node) : [];
