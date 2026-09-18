// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TBoxPaintPhase, TDrawSceneContext } from '../types';
import { TRenderTargetPool } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

export type TMaskRenderer = {
  context: TDrawSceneContext;
  gl: WebGL2RenderingContext;
  hoistedIds: Set<string>;
  paintLeaf: (node: TSceneNode, phase?: TBoxPaintPhase) => void;
  pool: TRenderTargetPool;
  refs: TCanvasRefs;
  sceneNodeById: Map<string, TSceneNode>;
};
