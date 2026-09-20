// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';
import { TMaskRenderer, TScissorRect } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { isBlurZoomChanging } from './isBlurZoomChanging';

export const canRenderGlassDirectly = (
  renderer: TMaskRenderer,
  node: TSceneNode,
  target: TRenderTarget | null,
  rect: TScissorRect | null,
): boolean =>
  target === null &&
  rect !== null &&
  (node.type === NodeType.rectangle || node.type === NodeType.frame) &&
  isBlurZoomChanging(renderer.gl, renderer.context.viewport.zoom, performance.now());
