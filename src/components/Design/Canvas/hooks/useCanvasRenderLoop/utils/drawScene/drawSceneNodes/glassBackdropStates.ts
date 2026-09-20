// types
import { TMaskRenderer, TScissorRect } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

export type TGlassBackdropState = {
  backdrop: TRenderTarget | null;
  dirty: TScissorRect[];
  fullyDirty: boolean;
  isMipmapped: boolean;
};

export const glassBackdropStates = new WeakMap<TMaskRenderer, TGlassBackdropState>();
