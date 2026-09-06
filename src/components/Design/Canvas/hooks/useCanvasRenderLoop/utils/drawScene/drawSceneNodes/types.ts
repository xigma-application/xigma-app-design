// types
import { TDrawSceneContext } from '../types';
import { TRenderTargetPool } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

export type TMaskRenderer = {
  context: TDrawSceneContext;
  gl: WebGL2RenderingContext;
  hoistedIds: Set<string>;
  paintLeaf: (node: TSceneNode) => void;
  pool: TRenderTargetPool;
  sceneNodeById: Map<string, TSceneNode>;
};
