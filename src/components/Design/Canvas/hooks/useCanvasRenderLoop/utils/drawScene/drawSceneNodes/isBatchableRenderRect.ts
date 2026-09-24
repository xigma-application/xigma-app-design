// types
import { TBatchShape } from 'utils/canvas/drawRectBatch/types';
import { TMaskRenderer } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { getRectBatchResources } from 'utils/canvas/drawRectBatch/getRectBatchResources';
import { glassBackdropStates } from './glassBackdropStates';
import { hasRealBlendMode } from './hasRealBlendMode';
import { hasRectRenderOverrides } from './hasRectRenderOverrides';
import { isBatchableShape } from './isBatchableShape';

export const isBatchableRenderRect = (renderer: TMaskRenderer, node: TSceneNode): node is TBatchShape =>
  isBatchableShape(node) &&
  !hasRectRenderOverrides(renderer.refs) &&
  !hasRealBlendMode(node, renderer.refs) &&
  !glassBackdropStates.get(renderer)?.backdrop &&
  getRectBatchResources(renderer.gl) !== null;
